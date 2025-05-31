export const dynamic = 'force-dynamic';
import { CONFIG_MAGAZZINO } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllPantoni } from '@/lib/pantoni/db';
import { normalizePantoni } from '@/lib/normalizers';
import { Table } from '@/components/ClientWrapper';

export default async function Magazzino() {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);

  return (
    <>
      <Table items={pantoni} config={CONFIG_MAGAZZINO} tableKey="magazzino" />
    </>
  );
}
