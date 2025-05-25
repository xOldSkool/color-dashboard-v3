import { Pantone } from '@/types/pantoneTypes';
import { Db, DeleteResult, InsertManyResult, InsertOneResult, ObjectId, UpdateFilter, UpdateOptions, UpdateResult } from 'mongodb';

// getAllPantoni -> Recupera tutti i documenti Pantone presenti nella collezione
// insertPantoni -> Inserisce uno o più documenti Pantone nella collezione
// updatePantone -> Aggiorna un singolo documento che soddisfa il filtro query
// deletePanotni -> Elimina uno o più documenti Pantone dalla collezione
// getPantonebyId -> Recupera un singolo Pantone tramite il suo ObjectId
// getPantoniByQuery -> Recupera documenti Pantone che corrispondono a una query

export async function getAllPantoni(db: Db): Promise<Pantone[]> {
  return await db.collection<Pantone>('pantoni').find({}).toArray();
}

export async function insertPantoni(db: Db, data: Pantone | Pantone[]): Promise<InsertOneResult<Pantone> | InsertManyResult<Pantone>> {
  const collection = db.collection<Pantone>('pantoni');
  if (Array.isArray(data)) {
    return await collection.insertMany(data);
  }
  return await collection.insertOne(data);
}

export async function updatePantone(db: Db, query: Partial<Pantone>, update: UpdateFilter<Pantone>, options?: UpdateOptions): Promise<UpdateResult> {
  return await db.collection<Pantone>('pantoni').updateOne(query, update, options);
}

export async function deletePantoni(db: Db, filter: Partial<Pantone> | ObjectId[]): Promise<DeleteResult> {
  const collection = db.collection<Pantone>('pantoni');
  // Se filter è un array, si usa deleteMany({ _id: { $in: filter } }).
  // Se filter è un oggetto, si usa deleteOne(filter).
  if (Array.isArray(filter)) {
    return await collection.deleteMany({ _id: { $in: filter } });
  } else {
    return await collection.deleteOne(filter);
  }
}

export async function getPantoneById(db: Db, id: string): Promise<Pantone | null> {
  return await db.collection<Pantone>('pantoni').findOne({ _id: new ObjectId(id) });
}

export async function getPantoniByQuery(db: Db, query: Partial<Pantone>): Promise<Pantone[]> {
  return await db.collection<Pantone>('pantoni').find(query).toArray();
}
