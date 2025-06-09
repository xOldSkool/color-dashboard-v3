import { getHexFromPantone } from '@/components/PantoneToHex';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { generaPantoneGroupId, insertMagazzinoIfNotExists, produciPantone } from '@/lib/pantoni/logic';
import { normalizzaBasi } from '@/lib/pantoni/normalizzaBasi';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { Pantone } from '@/types/pantoneTypes';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
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
    await insertMagazzinoIfNotExists(db, pantoneGroupId, rawData.tipo);
    if (rawData.noteMagazzino) {
      await db.collection('magazzinoPantoni').updateOne({ pantoneGroupId }, { $set: { noteMagazzino: rawData.noteMagazzino } });
    }

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

export async function PATCH(req: NextRequest) {
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
    await insertMagazzinoIfNotExists(db, pantoneGroupId, rawData.tipo);
    if (updateFields.noteMagazzino) {
      await db.collection('magazzinoPantoni').updateOne({ pantoneGroupId }, { $set: { noteMagazzino: updateFields.noteMagazzino } });
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...noIdData } = validation.data;
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: noIdData });

    return NextResponse.json({ message: 'Pantone aggiornato con successo!', id }, { status: 200 });
  } catch (error) {
    console.error('Errore aggiornamento Pantone:', error);
    return NextResponse.json({ error: 'Errore aggiornamento Pantone' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Pantone>('pantoni');
    const magazzinoCollection = db.collection('magazzinoPantoni');
    const body = await req.json();

    let ids: string[] = [];
    if (body.ids && Array.isArray(body.ids)) {
      ids = body.ids;
    } else if (body.id) {
      ids = [body.id];
    } else {
      return NextResponse.json({ error: 'ID non fornito' }, { status: 400 });
    }

    // Trova i pantoni da eliminare per recuperare i loro pantoneGroupId
    const objectIds = ids.map((id) => new ObjectId(id));
    const pantoniToDelete = await collection.find({ _id: { $in: objectIds } }).toArray();
    const groupIdsToCheck = [...new Set(pantoniToDelete.map((p) => p.pantoneGroupId))];

    // Elimina i pantoni
    const result = await collection.deleteMany({ _id: { $in: objectIds } });

    // Per ogni pantoneGroupId, elimina il magazzino se non ci sono più pantoni che lo usano
    for (const groupId of groupIdsToCheck) {
      const count = await collection.countDocuments({ pantoneGroupId: groupId });
      if (count === 0) {
        await magazzinoCollection.deleteOne({ pantoneGroupId: groupId });
      }
    }

    return NextResponse.json({ success: result.deletedCount > 0 });
  } catch (error) {
    console.error('Errore eliminazione Pantone:', error);
    return NextResponse.json({ error: 'Errore eliminazione Pantone' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const body = await req.json();
    const schema = z.object({
      pantoneId: z.string(),
      battute: z.number().min(1),
      urgente: z.boolean(),
    });
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
    }
    const { pantoneId, battute, urgente } = validation.data;
    // DEBUG: logga il risultato di produciPantone
    const result = await produciPantone({ db, pantoneId, battute, urgente });
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Errore produzione Pantone:', error);
    return NextResponse.json({ error: 'Errore produzione Pantone' }, { status: 500 });
  }
}
