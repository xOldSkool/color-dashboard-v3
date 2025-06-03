import { connectToDatabase } from '@/lib/connectToMongoDb';
import { NextRequest, NextResponse } from 'next/server';
import { getAllMagazzinoPantoni } from '@/lib/magazzinoPantoni/db';

export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const pantoneGroupId = searchParams.get('pantoneGroupId');
    const tipo = searchParams.get('tipo');
    if (!pantoneGroupId || !tipo) {
      return NextResponse.json({ error: 'pantoneGroupId e tipo sono obbligatori' }, { status: 400 });
    }
    const magazzinoPantoni = await getAllMagazzinoPantoni(db);
    const found = magazzinoPantoni.find((m) => m.pantoneGroupId === pantoneGroupId && m.tipo === tipo);
    if (!found) {
      return NextResponse.json({ error: 'Magazzino non trovato' }, { status: 404 });
    }
    return NextResponse.json(found, { status: 200 });
  } catch (error) {
    console.error('Errore recupero magazzinoPantoni:', error);
    return NextResponse.json({ error: 'Errore recupero magazzinoPantoni' }, { status: 500 });
  }
}
