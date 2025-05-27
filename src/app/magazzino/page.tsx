export const dynamic = 'force-dynamic';
import TableClient from '@/components/Tables/Table';
import { CONFIG_MAGAZZINO } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllPantoni } from '@/lib/pantoni/db';
import { normalizePantoni } from '@/lib/normalizers';

export default async function Magazzino() {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);

  return (
    <>
      <TableClient items={pantoni} config={CONFIG_MAGAZZINO} tableKey="magazzino" />
    </>
  );
}
