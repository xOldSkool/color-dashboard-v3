import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { consegnaSoloMagazzinoPantoni, consegnaSoloMateriali } from '@/lib/magazzinoPantoni/logic';
import { getPantoniByQuery } from '@/lib/pantoni/db';
import { getMaterialiByQuery } from '@/lib/materiali/db';
import { ObjectId } from 'mongodb';

const ConsegnaPantoneSchema = z.object({
  pantoneId: z.string(),
  pantoneGroupId: z.string(),
  tipo: z.string(),
  quantita: z.number().positive(),
  causale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = ConsegnaPantoneSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ success: false, error: 'Dati non validi', issues: parse.error.issues }, { status: 400 });
  }
  const { pantoneId, pantoneGroupId, quantita, causale } = parse.data;
  const db = await connectToDatabase();

  // Recupera il pantone (corretto: _id come ObjectId)
  const pantoni = await getPantoniByQuery(db, { _id: new ObjectId(pantoneId) });
  const pantone = pantoni[0];
  if (!pantone) {
    return NextResponse.json({ success: false, error: 'Pantone non trovato' }, { status: 404 });
  }

  // Cerca base con utilizzo Pantone
  const basePantone = pantone.basi?.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'));
  if (basePantone) {
    // Trova materiale corrispondente
    const materiali = await getMaterialiByQuery(db, {
      nomeMateriale: basePantone.nomeMateriale,
      fornitore: basePantone.fornitore,
      utilizzo: { $in: ['Pantone'] },
    });
    const materiale = materiali[0];
    if (materiale) {
      // Aggiorna solo materiali
      const resultMat = await consegnaSoloMateriali({
        db: db,
        materialeId: String(materiale._id),
        quantita: quantita,
        causale: causale || 'Consegna produzione',
      });
      if (!resultMat.success) {
        return NextResponse.json({ success: false, error: resultMat.error }, { status: 400 });
      }
    }
  }

  // Aggiorna sempre magazzinoPantoni
  const resultMag = await consegnaSoloMagazzinoPantoni({
    db: db,
    pantoneGroupId: pantoneGroupId,
    quantita: quantita,
    causale: causale || 'Consegna produzione',
  });
  if (!resultMag.success) {
    return NextResponse.json({ success: false, error: resultMag.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
