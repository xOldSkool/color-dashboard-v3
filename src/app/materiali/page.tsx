import Button from '@/components/Button';
import { Table } from '@/components/ClientWrapper';
import { CONFIG_MATERIALI } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllMateriali } from '@/lib/materiali/db';
import { normalizeMateriali } from '@/lib/normalizers';

export default async function MaterialiPage() {
  const db = await connectToDatabase();
  const raw = await getAllMateriali(db);
  const materiali = normalizeMateriali(raw);

  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center gap-2">
        <h1 className="text-4xl font-semibold">Materiali</h1>
        <div className="flex flex-row gap-2">
          <Button modalKey="newMateriale" iconName="plus" variant="primary">
            Crea Materiale
          </Button>
        </div>
      </div>
      <Table items={materiali} config={CONFIG_MATERIALI} tableKey="materiali" />
    </div>
  );
}
