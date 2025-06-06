import { MagazzinoPantoni } from '@/types/magazzinoPantoneTypes';
import { BaseMateriale, Materiale, MovimentoMateriale } from '@/types/materialeTypes';
import { Pantone } from '@/types/pantoneTypes';
import { Collection, Db, ObjectId } from 'mongodb';
import { calcolaProduzionePantone } from './calcoli';
import { normalizzaBasi } from './normalizzaBasi';

// Genera 'pantoneGroupId' in base a 'nomePantone', 'basi' e 'codiceFornitore' (se presente)
export async function generaPantoneGroupId(db: Db, nuovoPantone: Pantone): Promise<string> {
  const collection: Collection<Pantone> = db.collection('pantoni');
  const basiNormalizzate = normalizzaBasi(nuovoPantone.basi || []);

  // Costruisci il filtro di ricerca in base alle proprietà disponibili
  const filtro: Partial<Pick<Pantone, 'nomePantone' | 'basiNormalizzate' | 'codiceFornitore'>> = {
    nomePantone: nuovoPantone.nomePantone,
    basiNormalizzate,
  };
  if (nuovoPantone.codiceFornitore) {
    filtro.codiceFornitore = nuovoPantone.codiceFornitore;
  }

  const candidato = await collection.findOne(filtro);

  if (candidato) return candidato.pantoneGroupId;
  return `${nuovoPantone.nomePantone}_${new ObjectId().toHexString().slice(-6)}`;
}

// Funzione per creare il magazzino solo se non esiste
export async function insertMagazzinoIfNotExists(db: Db, groupId: string, tipo: string) {
  const collection: Collection<MagazzinoPantoni> = db.collection('magazzinoPantoni');
  const esiste = await collection.findOne({ pantoneGroupId: groupId });
  if (!esiste) {
    return await db.collection('magazzinoPantoni').insertOne({
      pantoneGroupId: groupId,
      dispMagazzino: 0,
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
    basi: pantone.basi,
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
    basi: pantone.basi,
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

// 🔑 assegnaPantoneGroupId
// Scopo: Determina il pantoneGroupId da assegnare a un nuovo pantone, confrontandolo con quelli già esistenti con lo stesso nomePantone.

// Come?
// 1️⃣ Cerca i pantoni esistenti con lo stesso nomePantone.
// 2️⃣ Confronta la composizione delle basi (normalizzaBasi).
// 3️⃣ Se trova un match, usa pantoneGroupId esistente o lo genera con _id.
// 4️⃣ Se non trova nulla, genera un nuovo pantoneGroupId unico (nomePantone_ID).

// 👌 insertMagazzinoIfNotExists
// Scopo: Inserisce un documento in magazzinoPantoni solo se non esiste già un record con lo stesso pantoneGroupId.

// Come?
// 1️⃣ Cerca magazzinoPantoni per pantoneGroupId.
// 2️⃣ Se esiste, non fa nulla.
// 3️⃣ Se non esiste, inserisce il documento inizializzando dispMagazzino e movimenti.

// 🧾 estraiBasi
// Scopo: Converte un oggetto payload generico (es. valori del form) e una lista di basi (BaseMateriale[]) in un array di { nome, label, quantita }.

// Come?
// 1️⃣ Prende ciascun elemento di basi, estraendo name e label.
// 2️⃣ Legge il quantita corrispondente da payload e lo converte in number.
// 3️⃣ Filtra per valori > 0.

// Perché? Serve per estrarre solo le basi effettivamente valorizzate dal form o da un input grezzo.
