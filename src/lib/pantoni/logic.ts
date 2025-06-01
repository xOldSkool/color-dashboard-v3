import { MagazzinoPantoni } from '@/types/magazzinoPantoneTypes';
import { BaseMateriale } from '@/types/materialeTypes';
import { BasiPantone, Pantone } from '@/types/pantoneTypes';
import { Collection, Db, ObjectId } from 'mongodb';

export function normalizzaBasi(basi: BasiPantone[] = []): string {
  return basi
    .filter((b) => b.quantita > 0)
    .sort((a, b) => a.nomeMateriale.localeCompare(b.nomeMateriale))
    .map((b) => `${b.nomeMateriale}:${b.label}:${b.quantita}:${b.fornitore}:${b.tipo}:${b.codiceColore}`)
    .join('|');
}

// Genera 'pantoneGroupId' in base a 'nomePantone' e 'basi'
export async function generaPantoneGroupId(db: Db, nuovoPantone: Pantone): Promise<string> {
  const collection: Collection<Pantone> = db.collection('pantoni');
  const basiNormalizzate = normalizzaBasi(nuovoPantone.basi || []);

  const candidato = await collection.findOne({
    nomePantone: nuovoPantone.nomePantone,
    basiNormalizzate,
  });

  if (candidato) return candidato.pantoneGroupId;
  return `${nuovoPantone.nomePantone}_${new ObjectId().toHexString().slice(-6)}`;
}

// 👌 Funzione per creare il magazzino solo se non esiste
export async function insertMagazzinoIfNotExists(db: Db, groupId: string, tipo: string) {
  const collection: Collection<MagazzinoPantoni> = db.collection('magazzinoPantoni');
  const esiste = await collection.findOne({ pantoneGroupId: groupId });
  if (!esiste) {
    return await db.collection('magazzinoPantoni').insertOne({
      pantoneGroupId: groupId,
      dispMagazzino: 0,
      tipo: tipo ?? 'EB',
      movimenti: [],
    });
  }
}

// Funzione ausiliaria per estrarre le basi da un payload
export function estraiBasi(payload: Record<string, string | number>, basi: BaseMateriale[]): { nome: string; label: string; quantita: number }[] {
  return basi
    .map(({ nomeMateriale: name, label }) => ({
      nome: name,
      label,
      quantita: parseFloat(String(payload[name])) || 0,
    }))
    .filter((b) => b.quantita > 0);
}

// normalizzaBasi
// Scopo: Converte un array di oggetti { name, quantita } in una stringa normalizzata ordinata per name. Serve per confrontare le basi indipendentemente dall'ordine.

// Perché? Quando confronti due composizioni di basi (ad esempio per capire se due pantoni sono uguali), l'ordine può cambiare. Ordinando e convertendo in stringa (name:quantita|...), il confronto è affidabile.

// 🔑 assegnaPantoneGroupId
// Scopo: Determina il pantoneGroupId da assegnare a un nuovo pantone, confrontandolo con quelli già esistenti con lo stesso nomePantone.

// Come?
// 1️⃣ Cerca i pantoni esistenti con lo stesso nomePantone.
// 2️⃣ Confronta la composizione delle basi (normalizzaBasi).
// 3️⃣ Se trova un match, usa pantoneGroupId esistente o lo genera con _id.
// 4️⃣ Se non trova nulla, genera un nuovo pantoneGroupId unico (nomePantone_ID).

// 👌 insertMagazzinoIfNotExists
// Scopo: Inserisce un documento in magazzinoPantoni solo se non esiste già un record con lo stesso pantoneGroupId.

// Come?
// 1️⃣ Cerca magazzinoPantoni per pantoneGroupId.
// 2️⃣ Se esiste, non fa nulla.
// 3️⃣ Se non esiste, inserisce il documento inizializzando dispMagazzino e movimenti.

// 🧾 estraiBasi
// Scopo: Converte un oggetto payload generico (es. valori del form) e una lista di basi (BaseMateriale[]) in un array di { nome, label, quantita }.

// Come?
// 1️⃣ Prende ciascun elemento di basi, estraendo name e label.
// 2️⃣ Legge il quantita corrispondente da payload e lo converte in number.
// 3️⃣ Filtra per valori > 0.

// Perché? Serve per estrarre solo le basi effettivamente valorizzate dal form o da un input grezzo.
