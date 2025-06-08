import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getPantoneMateriali } from '@/lib/materiali/logic';
import { MaterialeSchema } from '@/schemas/MaterialeSchema';
import { Materiale } from '@/types/materialeTypes';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const db = await connectToDatabase();
  const url = new URL(request.url);
  const utilizzo = url.searchParams.get('utilizzo');

  if (utilizzo === 'Pantone') {
    // Recupera solo i materiali Pantone tramite la business logic
    const pantoni = await getPantoneMateriali(db);
    try {
      const logPath = path.join(process.cwd(), 'debug-materiali.log');
      await fs.appendFile(logPath, 'Pantoni trovati: ' + JSON.stringify(pantoni) + '\n', 'utf8');
    } catch {}
    console.log('Pantoni trovati:', pantoni);
    // RIMOSSA VALIDAZIONE ZOD GLOBALE PER EVITARE ERRORI SU DATI LEGACY
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
    // DEBUG: logga il payload ricevuto
    try {
      const logPath = path.join(process.cwd(), 'debug-materiali.log');
      await fs.appendFile(logPath, 'PATCH payload: ' + JSON.stringify(rawData) + '\n', 'utf8');
    } catch {}

    // PATCH completo materiale
    if (rawData.fullUpdate === true) {
      const { id, ...materiale } = rawData;
      // Validazione Zod su tutto il materiale
      const validation = MaterialeSchema.safeParse(materiale);
      if (!validation.success) {
        return NextResponse.json({ error: 'Errore di validazione', details: validation.error.issues }, { status: 400 });
      }
      const { updateMaterialeCompletoLogic } = await import('@/lib/materiali/logic');
      await updateMaterialeCompletoLogic(db, id, materiale);
      return NextResponse.json({ message: 'Materiale aggiornato con successo!', id }, { status: 200 });
    }

    // PATCH solo movimento/quantità (default legacy)
    const { id, movimento, quantita } = rawData;
    if (!id || !movimento || typeof quantita !== 'number') {
      return NextResponse.json({ error: 'Dati insufficienti per aggiornamento' }, { status: 400 });
    }

    // Validazione SOLO sul movimento corrente
    const { MovimentoSchema } = await import('@/schemas/MaterialeSchema');
    const movimentoValidation = MovimentoSchema.safeParse(movimento);
    if (!movimentoValidation.success) {
      return NextResponse.json({ error: 'Errore di validazione movimento', details: movimentoValidation.error.issues }, { status: 400 });
    }

    const existingMateriale = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingMateriale) {
      return NextResponse.json({ error: 'Materiale non trovato' }, { status: 404 });
    }

    // Aggiorna array movimenti e quantità
    const movimentiAggiornati = [...(existingMateriale.movimenti || []), movimento];

    // --- LOGICA DISPONIBILITÀ MAGAZZINO PANTONI ---
    // Se il materiale è utilizzato come Pantone, aggiorna dispMagazzino del gruppo Pantone associato
    if (existingMateriale.utilizzo.includes('Pantone')) {
      // Trova il pantoneGroupId associato al materiale
      const { findPantoneGroupIdForMateriale } = await import('@/lib/pantoni/findPantoneGroupIdForMateriale');
      const pantoneGroupId = await findPantoneGroupIdForMateriale(db, existingMateriale.nomeMateriale, existingMateriale.fornitore);
      if (pantoneGroupId) {
        // Aggiorna dispMagazzino in base al tipo di movimento
        const { updateMagazzinoPantoni, getMagazzinoPantoniByQuery } = await import('@/lib/magazzinoPantoni/db');
        const magazzinoPantone = (await getMagazzinoPantoniByQuery(db, { pantoneGroupId }))[0];
        if (magazzinoPantone) {
          const nuovaDisp =
            movimento.tipo === 'carico' ? magazzinoPantone.dispMagazzino + movimento.quantita : magazzinoPantone.dispMagazzino - movimento.quantita;
          await updateMagazzinoPantoni(db, { pantoneGroupId }, { $set: { dispMagazzino: Math.round(nuovaDisp * 1000) / 1000 } });
        }
      }
    }
    // --- FINE LOGICA DISPONIBILITÀ MAGAZZINO PANTONI ---

    // Aggiorna solo i campi necessari senza validazione finale su tutto il materiale
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { quantita, movimenti: movimentiAggiornati } });

    return NextResponse.json({ message: 'Movimento aggiunto con successo!', id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore aggiornamento materiale', details: String(error) }, { status: 500 });
  }
}
