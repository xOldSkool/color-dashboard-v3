export const dynamic = 'force-dynamic';
import { Table } from '@/components/ClientWrapper';
import { H1 } from '@/components/UI/Titles&Texts';
import { CONFIG_INVENTARIO } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllMateriali } from '@/lib/materiali/db';
import { normalizeMateriali } from '@/lib/normalizers';
// import InventarioActions from './actions';

export default async function Inventario() {
  const db = await connectToDatabase();
  const raw = await getAllMateriali(db);
  const materiali = normalizeMateriali(raw);
  return (
    <div className="p-4">
      <H1>Inventario</H1>
      <Table items={materiali} config={CONFIG_INVENTARIO} tableKey="inventario" rows={50} />
      {/* <InventarioActions /> */}
    </div>
  );
}
