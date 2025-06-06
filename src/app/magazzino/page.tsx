import { CONFIG_MAGAZZINO_PANTONI } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllPantoni } from '@/lib/pantoni/db';
import { normalizePantoni } from '@/lib/normalizers';
import { Table } from '@/components/ClientWrapper';
import {} from '@/utils/mergePantoniMagazzino';
import { aggregateMagazzinoPantoni } from '@/lib/magazzinoPantoni/logic';
import { raggruppaPantoni } from '@/utils/raggruppaPantoni';
import { H1 } from '@/components/UI/Titles&Texts';

export default async function Magazzino() {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  const magazzinoPantoni = await aggregateMagazzinoPantoni(db);
  const raggruppati = raggruppaPantoni(pantoni, magazzinoPantoni);
  return (
    <div className="p-4">
      <H1>Magazzino</H1>
      <Table items={raggruppati} config={CONFIG_MAGAZZINO_PANTONI} tableKey="magazzino-pantoni" />
    </div>
  );
}
