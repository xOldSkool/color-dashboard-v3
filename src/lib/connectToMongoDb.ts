import { Db, MongoClient } from 'mongodb';

// variabili per tenere in memoria il client e il databse
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb; // se il db è già avviato lo usi (ritorni)

  const client = cachedClient ?? new MongoClient(process.env.MONGODB_URI as string); // se client è nullo ne crei uno nuovo
  if (!cachedClient) {
    await client.connect();
    cachedClient = client;
  } // se il client non esiste avvii la connessione e glielo passi.

  const db: Db = client.db('pantonedb');
  cachedDb = db;
  return db;
} // salva il db nella cache e lo restituisce

// Client chiama connectToDatabase() ->
//     - Se client/db già esistono -> uso quelli
//     - Se client/db non esistono -> creo nuova connessione
//     - NON scarico dati -> Solo connessione
//     - Quando faccio query -> MongoDB risponde ai dati richiesti
