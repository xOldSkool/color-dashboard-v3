import { Db, ObjectId } from 'mongodb';
import { Materiale, MovimentoMateriale } from '@/types/materialeTypes';
import { getMaterialiByQuery, updateMaterialeCompleto as updateMaterialeCompletoDb, getMaterialeById, updateMateriale } from './db';

// Funzione per ottenere solo i materiali con utilizzo: 'Pantone'
export async function getPantoneMateriali(db: Db): Promise<Materiale[]> {
  return getMaterialiByQuery(db, { utilizzo: { $in: ['Pantone'] } });
}

// Logica per aggiornamento completo materiale
export async function updateMaterialeCompletoLogic(db: Db, id: string, materiale: Omit<Materiale, '_id'>) {
  // Qui puoi aggiungere eventuale logica di business/normalizzazione
  return updateMaterialeCompletoDb(db, id, materiale);
}

// Logica per aggiornamento inventario materiali con movimenti
export async function updateInventarioMaterialiLogic(db: Db, modifiche: { id: string; quantitaReale: number }[]) {
  const results: Array<{ id: string; tipo?: 'carico' | 'scarico'; quantita?: number; success: boolean; error?: string }> = [];
  for (const mod of modifiche) {
    try {
      const materiale = await getMaterialeById(db, mod.id);
      if (!materiale) {
        results.push({ id: mod.id, success: false, error: 'Materiale non trovato' });
        continue;
      }
      const quantitaPrecedente = materiale.quantita;
      if (mod.quantitaReale === undefined || mod.quantitaReale === null) {
        results.push({ id: mod.id, success: false, error: 'Valore non valido' });
        continue;
      }
      if (mod.quantitaReale === quantitaPrecedente) {
        results.push({ id: mod.id, success: true });
        continue;
      }
      // Aggiorna la quantità
      await updateMateriale(db, { _id: new ObjectId(mod.id) }, { $set: { quantita: mod.quantitaReale } });
      // Crea movimento
      const tipo: 'carico' | 'scarico' = mod.quantitaReale > quantitaPrecedente ? 'carico' : 'scarico';
      const movimento: MovimentoMateriale = {
        tipo,
        quantita: Math.abs(mod.quantitaReale - quantitaPrecedente),
        data: new Date(),
        causale: 'Inventario',
      };
      // Aggiorna array movimenti
      await updateMateriale(db, { _id: new ObjectId(mod.id) }, { $push: { movimenti: movimento } });
      results.push({ id: mod.id, tipo, quantita: movimento.quantita, success: true });
    } catch (error) {
      results.push({ id: mod.id, success: false, error: String(error) });
    }
  }
  return results;
}
