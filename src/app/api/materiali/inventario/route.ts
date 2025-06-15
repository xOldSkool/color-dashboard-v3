import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { updateInventarioMaterialiLogic } from '@/lib/materiali/logic';

const InventarioUpdateSchema = z.object({
  modifiche: z.array(
    z.object({
      id: z.string(),
      quantitaReale: z.number(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const body = await request.json();
    const validation = InventarioUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Payload non valido', details: validation.error.issues }, { status: 400 });
    }
    const result = await updateInventarioMaterialiLogic(db, validation.data.modifiche);
    return NextResponse.json({ message: 'Inventario aggiornato', result });
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno', details: String(error) }, { status: 500 });
  }
}
