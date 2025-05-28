import { getHexFromPantone } from '@/components/PantoneToHex';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { generaPantoneGroupId, normalizzaBasi } from '@/lib/pantoni/logic';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { Pantone } from '@/types/pantoneTypes';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Pantone>('pantoni');

    const rawData = await req.json();
    const hex = getHexFromPantone(rawData.nomePantone);
    rawData.hex = hex;
    const pantoneGroupId = await generaPantoneGroupId(db, rawData);
    const basiNormalizzate = normalizzaBasi(rawData.basi);
    const dataCreazione = new Date();
    const nuovoPantone: Pantone = {
      ...rawData,
      pantoneGroupId,
      basiNormalizzate,
      dataCreazione,
    };

    // Validazione Zod sul payload
    const validation = PantoneSchema.safeParse(nuovoPantone);
    if (!validation.success) {
      return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
    }
    const result = await collection.insertOne(validation.data);

    return NextResponse.json({ message: 'Pantone creato con successo!', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Errore creazione Pantone:', error);
    return NextResponse.json({ error: 'Errore creazione Pantone' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Pantone>('pantoni');
    const rawData = await req.json();
    const { id, ...updateFields } = rawData;

    if (!id) {
      return NextResponse.json({ error: 'ID del pantone non fornito' }, { status: 400 });
    }

    const existingPantone = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingPantone) {
      return NextResponse.json({ error: 'Pantone non trovato' }, { status: 404 });
    }

    const updatedNomePantone = updateFields.nomePantone ?? existingPantone.nomePantone;
    const updatedBasi = updateFields.basi ?? existingPantone.basi;
    const hex = getHexFromPantone(updatedNomePantone);
    const basiNormalizzate = normalizzaBasi(updatedBasi);

    let pantoneGroupId = existingPantone.pantoneGroupId;
    if (updatedNomePantone !== existingPantone.nomePantone || basiNormalizzate !== existingPantone.basiNormalizzate) {
      pantoneGroupId = await generaPantoneGroupId(db, { ...existingPantone, ...updateFields, basi: updatedBasi });
    }

    const aggiornato: Pantone = {
      ...existingPantone,
      ...updateFields,
      hex,
      basiNormalizzate,
      pantoneGroupId,
    };

    // Validazione
    const validation = PantoneSchema.safeParse(aggiornato);
    if (!validation.success) {
      return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: validation.data });

    return NextResponse.json({ message: 'Pantone aggiornato con successo!', id }, { status: 200 });
  } catch (error) {
    console.error('Errore aggiornamento Pantone:', error);
    return NextResponse.json({ error: 'Errore aggiornamento Pantone' }, { status: 500 });
  }
}
