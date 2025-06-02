// import { Db, MongoClient } from 'mongodb';

// // variabili per tenere in memoria il client e il databse
// let cachedClient: MongoClient | null = null;
// let cachedDb: Db | null = null;

// export async function connectToDatabase(): Promise<Db> {
//   if (cachedDb) return cachedDb; // se il db è già avviato lo usi (ritorni)

//   const client = cachedClient ?? new MongoClient(process.env.MONGODB_URI as string); // se client è nullo ne crei uno nuovo
//   if (!cachedClient) {
//     await client.connect();
//     cachedClient = client;
//   } // se il client non esiste avvii la connessione e glielo passi.

//   const db: Db = client.db('pantonedb');
//   cachedDb = db;
//   return db;
// } // salva il db nella cache e lo restituisce

// // Client chiama connectToDatabase() ->
// //     - Se client/db già esistono -> uso quelli
// //     - Se client/db non esistono -> creo nuova connessione
// //     - NON scarico dati -> Solo connessione
// //     - Quando faccio query -> MongoDB risponde ai dati richiesti

import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

type clientPromise = Promise<MongoClient>;

declare global {
  // Per evitare errori TypeScript nel contesto serverless
  // e per garantire che globalThis mantenga il client
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise = global._mongoClientPromise ?? (global._mongoClientPromise = new MongoClient(uri, options).connect());

export default clientPromise;

export async function connectToDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('pantonedb');
}
