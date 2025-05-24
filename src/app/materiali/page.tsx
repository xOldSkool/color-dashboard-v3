import Button from '@/components/Button';
import TableClient from '@/components/Tables/Table';
import { CONFIG_MATERIALI } from '@/constants/defaultColumns';
import { getAllMateriali } from '@/lib/materiali';
import { connectToDatabase } from '@/lib/mongodb';
import { normalizeMateriali } from '@/lib/transformJSON';

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
      <TableClient
        items={materiali}
        config={CONFIG_MATERIALI}
        tableKey="materiali"
      />
    </div>
  );
}
