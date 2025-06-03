import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { annullaProduzionePantone } from '@/lib/pantoni/logic';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const body = await req.json();
    const schema = z.object({ pantoneId: z.string() });
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
    }
    const { pantoneId } = validation.data;
    const result = await annullaProduzionePantone({ db, pantoneId });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Errore annullamento produzione Pantone:', error);
    return NextResponse.json({ error: 'Errore annullamento produzione Pantone' }, { status: 500 });
  }
}
