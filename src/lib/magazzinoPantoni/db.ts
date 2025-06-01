import { MagazzinoPantoni } from '@/types/magazzinoPantoneTypes';
import { Db, ObjectId, InsertOneResult, InsertManyResult, UpdateResult, DeleteResult, UpdateFilter, UpdateOptions } from 'mongodb';

// Recupera tutti i record magazzinoPantoni
export async function getAllMagazzinoPantoni(db: Db): Promise<MagazzinoPantoni[]> {
  return await db.collection<MagazzinoPantoni>('magazzinoPantoni').find({}).toArray();
}

// Inserisce uno o più record magazzinoPantoni
export async function insertMagazzinoPantoni(
  db: Db,
  data: MagazzinoPantoni | MagazzinoPantoni[]
): Promise<InsertOneResult<MagazzinoPantoni> | InsertManyResult<MagazzinoPantoni>> {
  const collection = db.collection<MagazzinoPantoni>('magazzinoPantoni');
  if (Array.isArray(data)) {
    return await collection.insertMany(data);
  }
  return await collection.insertOne(data);
}

// Aggiorna un record magazzinoPantoni
export async function updateMagazzinoPantoni(
  db: Db,
  query: Partial<MagazzinoPantoni>,
  update: UpdateFilter<MagazzinoPantoni>,
  options?: UpdateOptions
): Promise<UpdateResult> {
  return await db.collection<MagazzinoPantoni>('magazzinoPantoni').updateOne(query, update, options);
}

// Elimina uno o più record magazzinoPantoni
export async function deleteMagazzinoPantoni(db: Db, filter: Partial<MagazzinoPantoni> | ObjectId[]): Promise<DeleteResult> {
  const collection = db.collection<MagazzinoPantoni>('magazzinoPantoni');
  if (Array.isArray(filter)) {
    return await collection.deleteMany({ _id: { $in: filter } });
  } else {
    return await collection.deleteOne(filter);
  }
}

// Recupera un record magazzinoPantoni per id
export async function getMagazzinoPantoniById(db: Db, id: string): Promise<MagazzinoPantoni | null> {
  return await db.collection<MagazzinoPantoni>('magazzinoPantoni').findOne({ _id: new ObjectId(id) });
}

// Recupera record magazzinoPantoni tramite query
export async function getMagazzinoPantoniByQuery(db: Db, query: Partial<MagazzinoPantoni>): Promise<MagazzinoPantoni[]> {
  return await db.collection<MagazzinoPantoni>('magazzinoPantoni').find(query).toArray();
}
