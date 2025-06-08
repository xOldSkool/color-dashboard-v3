import { Db, ObjectId, InsertOneResult, InsertManyResult, UpdateResult, DeleteResult, UpdateFilter, UpdateOptions, Filter } from 'mongodb';
import { Materiale } from '@/types/materialeTypes';

// Recupera tutti i materiali
export async function getAllMateriali(db: Db): Promise<Materiale[]> {
  return await db.collection<Materiale>('materiali').find({}).toArray();
}

// Inserisce uno o più materiali
export async function insertMateriale(db: Db, data: Materiale | Materiale[]): Promise<InsertOneResult<Materiale> | InsertManyResult<Materiale>> {
  const collection = db.collection<Materiale>('materiali');
  if (Array.isArray(data)) {
    return await collection.insertMany(data);
  }
  return await collection.insertOne(data);
}

// Aggiorna un materiale
export async function updateMateriale(
  db: Db,
  query: Partial<Materiale>,
  update: UpdateFilter<Materiale>,
  options?: UpdateOptions
): Promise<UpdateResult> {
  return await db.collection<Materiale>('materiali').updateOne(query, update, options);
}

// Aggiorna tutte le proprietà di un materiale (eccetto _id)
export async function updateMaterialeCompleto(db: Db, id: string, materiale: Omit<Materiale, '_id'>): Promise<UpdateResult> {
  return await db.collection<Materiale>('materiali').updateOne({ _id: new ObjectId(id) }, { $set: materiale });
}

// Elimina uno o più materiali
export async function deleteMateriale(db: Db, filter: Partial<Materiale> | ObjectId[]): Promise<DeleteResult> {
  const collection = db.collection<Materiale>('materiali');
  if (Array.isArray(filter)) {
    return await collection.deleteMany({ _id: { $in: filter } });
  } else {
    return await collection.deleteOne(filter);
  }
}

// Recupera un materiale per id
export async function getMaterialeById(db: Db, id: string): Promise<Materiale | null> {
  return await db.collection<Materiale>('materiali').findOne({ _id: new ObjectId(id) });
}

// Recupera materiali tramite query
export async function getMaterialiByQuery(db: Db, query: Filter<Materiale>): Promise<Materiale[]> {
  return await db.collection<Materiale>('materiali').find(query).toArray();
}
