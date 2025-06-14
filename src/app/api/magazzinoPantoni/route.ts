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

export async function PATCH(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const data = await req.json();
    console.log('[magazzinoPantoni PATCH] ricevo:', data);
    const { pantoneGroupId, tipo, movimento, ...rest } = data;
    if (!pantoneGroupId || !tipo) {
      return NextResponse.json({ error: 'pantoneGroupId e tipo sono obbligatori' }, { status: 400 });
    }
    const collection = db.collection('magazzinoPantoni');
    const magazzino = await collection.findOne({ pantoneGroupId, tipo });
    console.log('[magazzinoPantoni PATCH] trovato:', magazzino);
    if (!magazzino) {
      return NextResponse.json({ error: 'Magazzino non trovato' }, { status: 404 });
    }
    // Build $set only with defined fields (never set undefined/null accidentally)
    const setObj: Record<string, unknown> = {};
    for (const key of Object.keys(rest)) {
      if (rest[key] !== undefined) {
        setObj[key] = rest[key];
      }
    }
    if (Object.keys(setObj).length === 0 && !movimento) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }
    const update: Record<string, unknown> = {};
    if (Object.keys(setObj).length > 0) {
      update.$set = setObj;
    }
    if (movimento) {
      update.$push = { movimenti: movimento };
    }
    if (!update.$set && !update.$push) {
      // Defensive: never allow full replacement
      return NextResponse.json({ error: 'Aggiornamento non valido' }, { status: 400 });
    }
    console.log('[magazzinoPantoni PATCH] update:', update);
    await collection.updateOne({ pantoneGroupId, tipo }, update);
    return NextResponse.json({ message: 'Magazzino aggiornato con successo!' }, { status: 200 });
  } catch (error) {
    console.error('Errore aggiornamento magazzinoPantoni:', error);
    return NextResponse.json({ error: 'Errore aggiornamento magazzinoPantoni' }, { status: 500 });
  }
}
