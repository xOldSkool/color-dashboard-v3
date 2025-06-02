import { connectToDatabase } from '@/lib/connectToMongoDb';
import { MaterialeSchema, MaterialeSchemaOpzionale } from '@/schemas/MaterialeSchema';
import { Materiale } from '@/types/materialeTypes';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const db = await connectToDatabase();
  const materiali = await db.collection('materiali').find({}).toArray();
  return NextResponse.json(materiali);
}

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Materiale>('materiali');
    const nuovoMateriale = await request.json();

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

export async function PATCH(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Materiale>('materiali');
    const rawData = await request.json();
    const { id, fromUnload, ...updateFields } = rawData;

    if (!id) {
      return NextResponse.json({ error: 'ID del materiale non fornito' }, { status: 400 });
    }

    const existingMateriale = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingMateriale) {
      return NextResponse.json({ error: 'Materiale non trovato' }, { status: 404 });
    }

    const aggiornato: Materiale = {
      ...existingMateriale,
      ...updateFields,
    };

    // Validazione Zod
    const schema = fromUnload ? MaterialeSchemaOpzionale : MaterialeSchema;
    const validation = schema.safeParse(aggiornato);
    if (!validation.success) {
      console.error('Validation error:', validation.error.issues, aggiornato);
      return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json({ message: 'Materiale aggiornato con successo!', id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore aggiornamento materiale', details: String(error) }, { status: 500 });
  }
}
