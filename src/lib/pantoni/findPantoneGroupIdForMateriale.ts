import { Db } from 'mongodb';
import { Pantone } from '@/types/pantoneTypes';

/**
 * Trova il pantoneGroupId per un materiale dato nomeMateriale e fornitore.
 * Da usare solo lato server (API route o funzioni server-side).
 */
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
