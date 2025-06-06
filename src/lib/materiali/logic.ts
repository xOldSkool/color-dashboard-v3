import { Db } from 'mongodb';
import { Materiale } from '@/types/materialeTypes';
import { getMaterialiByQuery } from './db';

// Funzione di business logic per ottenere solo i materiali con utilizzo: 'Pantone'
export async function getPantoneMateriali(db: Db): Promise<Materiale[]> {
  // Eventuale logica aggiuntiva qui (es: ordinamento, filtri extra)
  return getMaterialiByQuery(db, { utilizzo: 'Pantone' });
}
