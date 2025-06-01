export const dynamic = 'force-dynamic';
import { Button } from '@/components/ClientWrapper';
import Table from '@/components/Tables/Table';
import { DEFAULT_COLS } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllPantoni } from '@/lib/pantoni/db';
import { normalizePantoni } from '@/lib/normalizers';
import { aggregateMagazzinoPantoni } from '@/lib/magazzinoPantoni/logic';
import { mergePantoniMagazzino } from '@/utils/mergePantoniMagazzino';

export default async function Ricettario() {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  const magazzinoPantoni = await aggregateMagazzinoPantoni(db);
  const Pantoni = mergePantoniMagazzino(pantoni, magazzinoPantoni);
  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center gap-2">
        <h1 className="text-4xl font-semibold">Ricettario</h1>

        <Button modalKey="newPantone" iconName="plus" variant="primary">
          Crea nuovo Pantone
        </Button>
      </div>
      <Table items={Pantoni} config={DEFAULT_COLS} tableKey="ricettario" />
    </div>
  );
}
