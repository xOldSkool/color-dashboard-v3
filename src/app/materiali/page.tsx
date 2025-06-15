export const dynamic = 'force-dynamic';
import Button from '@/components/Button';
import { Table } from '@/components/ClientWrapper';
import { H1 } from '@/components/UI/Titles&Texts';
import { CONFIG_MATERIALI } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllMateriali } from '@/lib/materiali/db';
import { normalizeMateriali } from '@/lib/normalizers';

export default async function Materiali() {
  const db = await connectToDatabase();
  const raw = await getAllMateriali(db);
  const materiali = normalizeMateriali(raw);

  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center gap-2">
        <H1>Materiali</H1>
        <div className="flex flex-row gap-2">
          <Button modalKey="newMateriale" iconName="loadnew" variant="primary">
            Crea Materiale
          </Button>
        </div>
      </div>
      <Table items={materiali} config={CONFIG_MATERIALI} tableKey="materiali" />
    </div>
  );
}
