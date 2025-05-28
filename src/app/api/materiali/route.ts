import { connectToDatabase } from '@/lib/connectToMongoDb';
import { MaterialeSchema } from '@/schemas/MaterialeSchema';
import { Materiale } from '@/types/materialeTypes';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = await connectToDatabase();
  const materiali = await db.collection('materiali').find({}).toArray();
  return NextResponse.json(materiali);
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Materiale>('materiali');
    const nuovoMateriale = await request.json();

    console.log('Ricevuto:', nuovoMateriale);

    // Validazione Zod sul payload
    const validation = MaterialeSchema.safeParse(nuovoMateriale);
    if (!validation.success) {
      return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
    }
    const result = await collection.insertOne(nuovoMateriale);

    return NextResponse.json({ message: 'Materiale creato', insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Errore durante la creazione del materiale', error: String(error) }, { status: 500 });
  }
}
