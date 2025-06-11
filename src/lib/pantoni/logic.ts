import { MagazzinoPantoni } from '@/types/magazzinoPantoneTypes';
import { BaseMateriale, Materiale, MovimentoMateriale } from '@/types/materialeTypes';
import { Pantone, BasiPantone } from '@/types/pantoneTypes';
import { Collection, Db, ObjectId } from 'mongodb';
import { calcolaProduzionePantone } from './calcoli';
import { normalizzaBasi } from './normalizzaBasi';

// Utility per forzare utilizzo come array di stringhe
function normalizzaUtilizzoBase(b: { utilizzo?: unknown }): string[] {
  if (Array.isArray(b.utilizzo)) return b.utilizzo.map((v) => String(v));
  if (typeof b.utilizzo === 'string' && b.utilizzo.length > 0)
    return b.utilizzo
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  return [];
}

// Genera 'pantoneGroupId' in base a 'nomePantone', 'basi' e 'codiceFornitore' (se presente)
export async function generaPantoneGroupId(db: Db, nuovoPantone: Pantone): Promise<string> {
  const collection: Collection<Pantone> = db.collection('pantoni');
  const basiNormalizzate = normalizzaBasi(nuovoPantone.basi || []);

  // Costruisci il filtro di ricerca in base alle proprietà disponibili
  const candidato = await collection.findOne({
    nomePantone: nuovoPantone.nomePantone,
    basiNormalizzate,
  });

  if (candidato) return candidato.pantoneGroupId;
  return `${nuovoPantone.nomePantone}_${new ObjectId().toHexString().slice(-6)}`;
}

// Funzione per creare il magazzino solo se non esiste
export async function insertMagazzinoIfNotExists(db: Db, groupId: string, tipo: string, basi?: BasiPantone[]) {
  const collection: Collection<MagazzinoPantoni> = db.collection('magazzinoPantoni');
  const esiste = await collection.findOne({ pantoneGroupId: groupId });
  if (!esiste) {
    let dispMagazzino = 0;
    if (basi && Array.isArray(basi)) {
      // Cerca una base con utilizzo Pantone
      const basePantone = basi.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'));
      if (basePantone) {
        // Cerca il materiale corrispondente
        const materiale = await db.collection<Materiale>('materiali').findOne({
          nomeMateriale: basePantone.nomeMateriale,
          fornitore: basePantone.fornitore,
        });
        if (materiale) {
          dispMagazzino = materiale.quantita;
        }
      }
    }
    return await db.collection('magazzinoPantoni').insertOne({
      pantoneGroupId: groupId,
      dispMagazzino,
      tipo: tipo ?? 'EB',
      movimenti: [],
    });
  }
}

// Funzione ausiliaria per estrarre le basi da un payload
export function estraiBasi(payload: Record<string, string | number>, basi: BaseMateriale[]): { nome: string; label: string; quantita: number }[] {
  return basi
    .map(({ nomeMateriale: name, label }) => ({
      nome: name,
      label,
      quantita: parseFloat(String(payload[name])) || 0,
    }))
    .filter((b) => b.quantita > 0);
}

// Funzione principale per la composizione di un pantone
export async function produciPantone({ db, pantoneId, battute, urgente }: { db: Db; pantoneId: string; battute: number; urgente: boolean }) {
  // Recupera pantone
  const pantone = await db.collection<Pantone>('pantoni').findOne({ _id: new ObjectId(pantoneId) });
  if (!pantone) throw new Error('Pantone non trovato');
  if (!pantone.basi || !Array.isArray(pantone.basi)) throw new Error('Pantone senza basi');

  // Normalizza utilizzo basi
  const basiNormalizzate = pantone.basi.map((b) => ({ ...b, utilizzo: normalizzaUtilizzoBase(b) }));

  // Recupera dispMagazzino
  const magazzinoPantone = await db
    .collection<MagazzinoPantoni>('magazzinoPantoni')
    .findOne({ pantoneGroupId: pantone.pantoneGroupId, tipo: pantone.tipo });
  const dispMagazzino = magazzinoPantone?.dispMagazzino || 0;

  // Calcoli centralizzati
  const { kgTotali, nDosi, basiRisultato } = calcolaProduzionePantone({
    consumo: pantone.consumo,
    dose: pantone.dose,
    battute,
    dispMagazzino,
    basi: basiNormalizzate,
  });

  // Verifica disponibilità basi in materiali
  const materiali: Materiale[] = await db
    .collection<Materiale>('materiali')
    .find({
      nomeMateriale: { $in: basiRisultato.map((b) => b.nomeMateriale) },
    })
    .toArray();
  const basiNonDisponibili = basiRisultato.filter((b) => {
    const mat = materiali.find((m) => m.nomeMateriale === b.nomeMateriale);
    return !mat || mat.quantita < b.kgRichiesti;
  });
  if (basiNonDisponibili.length > 0) {
    return {
      success: false,
      error: 'Basi non disponibili',
      basiNonDisponibili: basiNonDisponibili.map((b) => ({ nomeMateriale: b.nomeMateriale, richiesti: b.kgRichiesti })),
    };
  }

  // Aggiorna pantone
  await db.collection<Pantone>('pantoni').updateOne(
    { _id: new ObjectId(pantoneId) },
    {
      $set: {
        daProdurre: true,
        qtDaProdurre: kgTotali,
        battuteDaProdurre: battute,
        urgente,
      },
    }
  );

  // Scarico materiali e movimenti
  for (const b of basiRisultato) {
    const materiale = materiali.find((m) => m.nomeMateriale === b.nomeMateriale);
    if (!materiale) continue;
    const quantitaScarico = Math.round(b.kgRichiesti * 1000) / 1000;
    const nuovoMovimento: MovimentoMateriale = {
      tipo: 'scarico',
      quantita: quantitaScarico,
      data: new Date(),
      causale: `Uso produzione ${pantone.nomePantone}`,
      riferimentoPantone: pantone.nomePantone,
    };
    const nuovaQuantita = parseFloat((materiale.quantita - quantitaScarico).toFixed(3));
    await db.collection<Materiale>('materiali').updateOne(
      { _id: materiale._id },
      {
        $set: { quantita: nuovaQuantita },
        $push: { movimenti: nuovoMovimento },
      }
    );
  }

  return {
    success: true,
    kgTotali,
    nDosi,
    basiRisultato,
  };
}

// Funzione per annullare la produzione di un pantone e ripristinare i materiali
export async function annullaProduzionePantone({ db, pantoneId }: { db: Db; pantoneId: string }) {
  // Recupera pantone
  const pantone = await db.collection<Pantone>('pantoni').findOne({ _id: new ObjectId(pantoneId) });
  if (!pantone) throw new Error('Pantone non trovato');
  if (!pantone.basi || !Array.isArray(pantone.basi)) throw new Error('Pantone senza basi');
  if (!pantone.battuteDaProdurre || !pantone.daProdurre) throw new Error('Pantone non in stato "da produrre"');

  // Normalizza utilizzo basi
  const basiNormalizzate = pantone.basi.map((b) => ({ ...b, utilizzo: normalizzaUtilizzoBase(b) }));

  // Recupera dispMagazzino
  const magazzinoPantone = await db
    .collection<MagazzinoPantoni>('magazzinoPantoni')
    .findOne({ pantoneGroupId: pantone.pantoneGroupId, tipo: pantone.tipo });
  const dispMagazzino = magazzinoPantone?.dispMagazzino || 0;

  // Calcoli centralizzati (usando le stesse battuteDaProdurre)
  const { basiRisultato } = calcolaProduzionePantone({
    consumo: pantone.consumo,
    dose: pantone.dose,
    battute: pantone.battuteDaProdurre,
    dispMagazzino,
    basi: basiNormalizzate,
  });

  // Ripristina materiali e aggiungi movimento di carico
  const materiali: Materiale[] = await db
    .collection<Materiale>('materiali')
    .find({
      nomeMateriale: { $in: basiRisultato.map((b) => b.nomeMateriale) },
    })
    .toArray();

  for (const b of basiRisultato) {
    const materiale = materiali.find((m) => m.nomeMateriale === b.nomeMateriale);
    if (!materiale) continue;
    const quantitaCarico = Math.round(b.kgRichiesti * 1000) / 1000;
    const nuovoMovimento: MovimentoMateriale = {
      tipo: 'carico',
      quantita: quantitaCarico,
      data: new Date(),
      causale: `Eliminata produzione ${pantone.nomePantone}`,
      riferimentoPantone: pantone.nomePantone,
    };
    const nuovaQuantita = parseFloat((materiale.quantita + quantitaCarico).toFixed(3));
    await db.collection<Materiale>('materiali').updateOne(
      { _id: materiale._id },
      {
        $set: { quantita: nuovaQuantita },
        $push: { movimenti: nuovoMovimento },
      }
    );
  }

  // Aggiorna pantone: resetta stato produzione
  await db.collection<Pantone>('pantoni').updateOne(
    { _id: new ObjectId(pantoneId) },
    {
      $set: {
        daProdurre: false,
        qtDaProdurre: 0,
        battuteDaProdurre: 0,
        urgente: false,
      },
    }
  );

  return { success: true };
}

export async function findPantoneGroupIdForMateriale(db: Db, nomeMateriale: string, fornitore: string): Promise<string | null> {
  const pantone = await db.collection<Pantone>('pantoni').findOne({
    basi: {
      $elemMatch: {
        nomeMateriale,
        fornitore,
        utilizzo: { $in: ['Pantone'] },
      },
    },
  });
  return pantone?.pantoneGroupId || null;
}
