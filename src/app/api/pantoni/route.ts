import { connectToDatabase } from '@/lib/connectToMongoDb';
import { generaPantoneGroupId, normalizzaBasi } from '@/lib/pantoni/logic';
import { Pantone } from '@/types/pantoneTypes';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Pantone>('pantoni');
    const nuovoPantone: Pantone = await req.json();

    // Aggiunge 'pantoneGroupId' e normalizza 'basi'
    const pantoneGroupId = await generaPantoneGroupId(db, nuovoPantone);
    const basiNormalizzate = normalizzaBasi(nuovoPantone.basi);

    const result = await collection.insertOne({
      ...nuovoPantone,
      pantoneGroupId,
      basiNormalizzate,
      dataCreazione: new Date(),
    });
    return NextResponse.json({ message: 'Pantone creato con successo!', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Errore creazione Pantone:', error);
    return NextResponse.json({ error: 'Errore creazione Pantone' }, { status: 500 });
  }
}
