export const dynamic = 'force-dynamic';
import { H1 } from '@/components/UI/Titles&Texts';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllMateriali } from '@/lib/materiali/db';
import { normalizeMateriali } from '@/lib/normalizers';
import InventarioClient from './InventarioClient';

export default async function Inventario() {
  const db = await connectToDatabase();
  const raw = await getAllMateriali(db);
  const materiali = normalizeMateriali(raw);
  return (
    <div className="p-4">
      <H1>Inventario</H1>
      <InventarioClient materiali={materiali} />
    </div>
  );
}
