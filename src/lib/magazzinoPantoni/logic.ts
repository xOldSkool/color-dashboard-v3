import { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import { MovimentoMagazzino } from '@/types/magazzinoPantoneTypes';
import { MovimentoMateriale } from '@/types/materialeTypes';
import { updateMagazzinoPantoni, getMagazzinoPantoniByQuery } from './db';
import { updateMateriale, getMaterialeById } from '@/lib/materiali/db';

export async function aggregateMagazzinoPantoni(db: Db) {
  const magazzino = await db.collection('magazzinoPantoni').find().toArray();
  const pantoni = await db.collection('pantoni').find().toArray();

  return magazzino.map((m) => {
    const pantoniGroup = pantoni.filter((p) => p.pantoneGroupId === m.pantoneGroupId);
    return {
      _id: m._id.toString(),
      pantoneGroupId: m.pantoneGroupId,
      nomePantone: pantoniGroup[0]?.nomePantone ?? '',
      tipo: m.tipo,
      dispMagazzino: m.dispMagazzino,
      ultimoUso: m.ultimoUso,
      noteMagazzino: m.noteMagazzino,
      noteColore: m.noteColore,
      count: pantoniGroup.length,
    };
  });
}

export async function updatePantoneAndMaterialStock({
  db,
  pantoneGroupId,
  materialeId,
  quantita,
  operazione,
  causale = '',
}: {
  db: Db;
  pantoneGroupId: string;
  materialeId: string;
  quantita: number;
  operazione: 'carico' | 'scarico';
  causale?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (quantita <= 0) return { success: false, error: 'Quantità deve essere positiva' };

  // Recupera magazzinoPantoni
  const magazzinoArr = await getMagazzinoPantoniByQuery(db, { pantoneGroupId });
  const magazzino = magazzinoArr[0];
  if (!magazzino) return { success: false, error: 'MagazzinoPantoni non trovato' };

  // Recupera materiale
  const materiale = await getMaterialeById(db, materialeId);
  if (!materiale) return { success: false, error: 'Materiale non trovato' };

  // Calcola nuove quantità
  const nuovaDispMagazzino = operazione === 'carico' ? magazzino.dispMagazzino + quantita : magazzino.dispMagazzino - quantita;
  const nuovaQuantitaMateriale = operazione === 'carico' ? materiale.quantita + quantita : materiale.quantita - quantita;

  if (nuovaDispMagazzino < 0) return { success: false, error: 'dispMagazzino negativo non consentito' };
  if (nuovaQuantitaMateriale < 0) return { success: false, error: 'quantita materiale negativa non consentita' };

  // Prepara movimenti
  const movimentoMagazzino: MovimentoMagazzino = {
    tipo: operazione,
    quantita,
    data: new Date().toISOString(),
    causale,
  };
  const movimentoMateriale: MovimentoMateriale = {
    tipo: operazione,
    quantita,
    data: new Date().toISOString(),
    causale,
    riferimentoPantone: pantoneGroupId,
  };

  // Aggiorna magazzinoPantoni
  await updateMagazzinoPantoni(
    db,
    { pantoneGroupId },
    {
      $set: { dispMagazzino: nuovaDispMagazzino, ultimoUso: new Date().toISOString() },
      $push: { movimenti: movimentoMagazzino },
    }
  );

  // Aggiorna materiale
  await updateMateriale(
    db,
    { _id: typeof materiale._id === 'string' ? new ObjectId(materiale._id) : materiale._id },
    {
      $set: { quantita: nuovaQuantitaMateriale },
      $push: { movimenti: movimentoMateriale },
    }
  );

  return { success: true };
}

/**
 * Scarica/consegna dal magazzinoPantoni (solo dispMagazzino e movimenti)
 */
export async function consegnaSoloMagazzinoPantoni({
  db,
  pantoneGroupId,
  quantita,
  causale = '',
}: {
  db: import('mongodb').Db;
  pantoneGroupId: string;
  quantita: number;
  causale?: string;
}): Promise<{ success: boolean; error?: string }> {
  const magazzinoArr = await getMagazzinoPantoniByQuery(db, { pantoneGroupId });
  const magazzino = magazzinoArr[0];
  if (!magazzino) return { success: false, error: 'MagazzinoPantoni non trovato' };
  if (magazzino.dispMagazzino < quantita) return { success: false, error: 'Quantità non disponibile in magazzino' };
  await updateMagazzinoPantoni(
    db,
    { pantoneGroupId },
    {
      $inc: { dispMagazzino: -quantita },
      $set: { ultimoUso: new Date().toISOString() },
      $push: {
        movimenti: {
          tipo: 'scarico',
          quantita,
          data: new Date().toISOString(),
          causale: causale || 'Consegna produzione',
        },
      },
    }
  );
  return { success: true };
}

/**
 * Scarica/consegna da materiali (solo materiali, aggiorna quantita e movimenti)
 */
export async function consegnaSoloMateriali({
  db,
  materialeId,
  quantita,
  causale = '',
}: {
  db: import('mongodb').Db;
  materialeId: string;
  quantita: number;
  causale?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { getMaterialeById, updateMateriale } = await import('@/lib/materiali/db');
  const materiale = await getMaterialeById(db, materialeId);
  if (!materiale) return { success: false, error: 'Materiale non trovato' };
  if (materiale.quantita < quantita) return { success: false, error: 'Quantità non disponibile nel materiale' };
  await updateMateriale(
    db,
    { _id: typeof materiale._id === 'string' ? new (await import('mongodb')).ObjectId(materiale._id) : materiale._id },
    {
      $inc: { quantita: -quantita },
      $push: {
        movimenti: {
          tipo: 'scarico',
          quantita,
          data: new Date().toISOString(),
          causale: causale || 'Consegna produzione',
        },
      },
    }
  );
  return { success: true };
}
