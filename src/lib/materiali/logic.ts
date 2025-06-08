import { Db } from 'mongodb';
import { Materiale } from '@/types/materialeTypes';
import { getMaterialiByQuery, updateMaterialeCompleto as updateMaterialeCompletoDb } from './db';

// Funzione per ottenere solo i materiali con utilizzo: 'Pantone'
export async function getPantoneMateriali(db: Db): Promise<Materiale[]> {
  return getMaterialiByQuery(db, { utilizzo: { $in: ['Pantone'] } });
}

// Logica per aggiornamento completo materiale
export async function updateMaterialeCompletoLogic(db: Db, id: string, materiale: Omit<Materiale, '_id'>) {
  // Qui puoi aggiungere eventuale logica di business/normalizzazione
  return updateMaterialeCompletoDb(db, id, materiale);
}
