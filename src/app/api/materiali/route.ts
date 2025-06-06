import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getPantoneMateriali } from '@/lib/materiali/logic';
import { MaterialeSchema, MaterialeSchemaOpzionale } from '@/schemas/MaterialeSchema';
import { Materiale } from '@/types/materialeTypes';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const db = await connectToDatabase();
  const url = new URL(request.url);
  const utilizzo = url.searchParams.get('utilizzo');

  if (utilizzo === 'Pantone') {
    // Recupera solo i materiali Pantone tramite la business logic
    const pantoni = await getPantoneMateriali(db);
    // Validazione Zod array
    const validation = MaterialeSchema.array().safeParse(pantoni);
    if (!validation.success) {
      return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
    }
    return NextResponse.json(pantoni);
  }

  // Default: tutti i materiali
  const materiali = await db.collection('materiali').find({}).toArray();
  return NextResponse.json(materiali);
}

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Materiale>('materiali');
    const nuovoMateriale = await request.json();

    // Arrotonda quantita a 3 decimali se presente
    if (typeof nuovoMateriale.quantita === 'number') {
      nuovoMateriale.quantita = Math.round(nuovoMateriale.quantita * 1000) / 1000;
    }

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

    // Arrotonda quantita a 3 decimali se presente
    if (typeof updateFields.quantita === 'number') {
      updateFields.quantita = Math.round(updateFields.quantita * 1000) / 1000;
    }

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
