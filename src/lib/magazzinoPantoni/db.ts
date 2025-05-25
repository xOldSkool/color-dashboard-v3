import { Db, ObjectId, InsertOneResult, InsertManyResult, UpdateResult, DeleteResult, UpdateFilter, UpdateOptions } from 'mongodb';
import { MagazzinoPantone } from '@/types/magazzinoPantoneTypes';

// Recupera tutti i record magazzinoPantone
export async function getAllMagazzinoPantone(db: Db): Promise<MagazzinoPantone[]> {
  return await db.collection<MagazzinoPantone>('magazzinoPantoni').find({}).toArray();
}

// Inserisce uno o più record magazzinoPantone
export async function insertMagazzinoPantone(
  db: Db,
  data: MagazzinoPantone | MagazzinoPantone[]
): Promise<InsertOneResult<MagazzinoPantone> | InsertManyResult<MagazzinoPantone>> {
  const collection = db.collection<MagazzinoPantone>('magazzinoPantoni');
  if (Array.isArray(data)) {
    return await collection.insertMany(data);
  }
  return await collection.insertOne(data);
}

// Aggiorna un record magazzinoPantone
export async function updateMagazzinoPantone(
  db: Db,
  query: Partial<MagazzinoPantone>,
  update: UpdateFilter<MagazzinoPantone>,
  options?: UpdateOptions
): Promise<UpdateResult> {
  return await db.collection<MagazzinoPantone>('magazzinoPantoni').updateOne(query, update, options);
}

// Elimina uno o più record magazzinoPantone
export async function deleteMagazzinoPantone(db: Db, filter: Partial<MagazzinoPantone> | ObjectId[]): Promise<DeleteResult> {
  const collection = db.collection<MagazzinoPantone>('magazzinoPantoni');
  if (Array.isArray(filter)) {
    return await collection.deleteMany({ _id: { $in: filter } });
  } else {
    return await collection.deleteOne(filter);
  }
}

// Recupera un record magazzinoPantone per id
export async function getMagazzinoPantoneById(db: Db, id: string): Promise<MagazzinoPantone | null> {
  return await db.collection<MagazzinoPantone>('magazzinoPantoni').findOne({ _id: new ObjectId(id) });
}

// Recupera record magazzinoPantone tramite query
export async function getMagazzinoPantoneByQuery(db: Db, query: Partial<MagazzinoPantone>): Promise<MagazzinoPantone[]> {
  return await db.collection<MagazzinoPantone>('magazzinoPantoni').find(query).toArray();
}
