import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { updatePantoneAndMaterialStock } from '@/lib/magazzinoPantoni/logic';
import { findPantoneGroupIdForMateriale } from '@/lib/pantoni/findPantoneGroupIdForMateriale';

const CaricoScaricoPantoneSchema = z.object({
  materialeId: z.string(),
  nomeMateriale: z.string(),
  fornitore: z.string(),
  quantita: z.number().positive(),
  operazione: z.enum(['carico', 'scarico']),
  causale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = CaricoScaricoPantoneSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ success: false, error: 'Dati non validi', issues: parse.error.issues }, { status: 400 });
  }
  const { materialeId, nomeMateriale, fornitore, quantita, operazione, causale } = parse.data;
  const db = await connectToDatabase();
  const pantoneGroupId = await findPantoneGroupIdForMateriale(db, nomeMateriale, fornitore);
  if (!pantoneGroupId) {
    return NextResponse.json({ success: false, error: 'pantoneGroupId non trovato per il materiale richiesto' }, { status: 404 });
  }
  const result = await updatePantoneAndMaterialStock({
    db,
    pantoneGroupId,
    materialeId,
    quantita,
    operazione,
    causale: causale || '',
  });
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
