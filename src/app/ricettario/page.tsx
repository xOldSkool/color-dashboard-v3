export const dynamic = 'force-dynamic';
import { Button } from '@/components/ClientWrapper';
import Table from '@/components/Tables/Table';
import { DEFAULT_COLS } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/mongodb';
import { getAllPantoni } from '@/lib/pantoni/db';
import { normalizePantoni } from '@/lib/transformJSON';

export default async function Ricettario() {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  return (
    <>
      <div className="flex flex-row justify-between items-center gap-2">
        <h1 className="text-4xl font-semibold">Ricettario</h1>

        <Button modalKey="newPantone" iconName="plus" variant="primary">
          Crea nuovo Pantone
        </Button>
      </div>
      <Table items={pantoni} config={DEFAULT_COLS} tableKey="ricettario" />
    </>
  );
}
