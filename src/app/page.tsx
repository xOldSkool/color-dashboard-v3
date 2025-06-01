export const dynamic = 'force-dynamic';
import { Table } from '@/components/ClientWrapper';
import { CONFIG_CONSEGNATI_PRODUZIONE, CONFIG_DA_PRODURRE } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { normalizePantoni } from '@/lib/normalizers';
import { getAllPantoni } from '@/lib/pantoni/db';

export default async function Home() {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  return (
    <div className="p-4">
      <h1 className="text-4xl font-semibold">Pantoni da produrre</h1>
      <Table items={pantoni} config={CONFIG_DA_PRODURRE} tableKey="da-produrre" rows={5} />
      <h1 className="text-4xl font-semibold mt-10">Pantoni consegnati alla produzione</h1>
      <Table items={pantoni} config={CONFIG_CONSEGNATI_PRODUZIONE} tableKey="consegnati-produzione" rows={10} />
    </div>
  );
}
