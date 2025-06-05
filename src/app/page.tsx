export const dynamic = 'force-dynamic';
import { Table } from '@/components/ClientWrapper';
import { H1 } from '@/components/UI/Titles&Texts';
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
      <H1>Pantoni da produrre</H1>
      <Table items={pantoni} config={CONFIG_DA_PRODURRE} tableKey="da-produrre" rows={5} />
      <H1 className="mt-5">Pantoni consegnati alla produzione</H1>
      <Table items={pantoni} config={CONFIG_CONSEGNATI_PRODUZIONE} tableKey="consegnati-produzione" rows={10} />
    </div>
  );
}
