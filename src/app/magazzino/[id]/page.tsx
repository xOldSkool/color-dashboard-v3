import { Table } from '@/components/ClientWrapper';
import { DEFAULT_COLS } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { aggregateMagazzinoPantoni } from '@/lib/magazzinoPantoni/logic';
import { normalizePantoni } from '@/lib/normalizers';
import { getAllPantoni } from '@/lib/pantoni/db';

export default async function MagazzinoPage({ params }: { params: { id: string } }) {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  const magazzinoPantoni = await aggregateMagazzinoPantoni(db);
  const gruppo = magazzinoPantoni.find((g) => g.pantoneGroupId === params.id);
  const pantoniDelGruppo = pantoni.filter((p) => p.pantoneGroupId === params.id);
  const hex = pantoniDelGruppo[0]?.hex;

  if (!gruppo) return <p>Gruppo magazzino non trovato. Contattare lo sviluppatore!</p>;

  return (
    <div className="p-6 mx-auto">
      {/* INTESTAZIONE */}
      <div className="flex flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-medium">
          Scheda magazzino <span className="font-bold">{gruppo.nomePantone || gruppo.pantoneGroupId}</span>
        </h1>
      </div>

      {/* DETTAGLI GRUPPO */}
      <div className="flex flex-row gap-4 items-center border border-dashed border-[var(--border)] rounded-xl shadow-lg shadow-white/10 p-4 mb-8">
        <div className="h-54 w-54 rounded-xl" style={{ backgroundColor: hex }}></div>
        <div className="flex flex-col self-start ml-10">
          <ul className="text-xl">
            <li className="flex flex-row gap-2">
              <span className="font-semibold">Nome Pantone:</span>
              {gruppo.nomePantone}
            </li>
            <li className="flex flex-row gap-2">
              <span className="font-semibold">Tipo:</span>
              {gruppo.tipo}
            </li>
            <li className="flex flex-row gap-2">
              <span className="font-semibold">Disponibilità magazzino:</span>
              {gruppo.dispMagazzino} kg
            </li>
            <li className="flex flex-row gap-2">
              <span className="font-semibold">Ultimo uso:</span>
              {gruppo.ultimoUso ? new Date(gruppo.ultimoUso).toLocaleString('it-IT') : '-'}
            </li>
            <li className="flex flex-row gap-2">
              <span className="font-semibold">Note magazzino:</span>
              {gruppo.noteMagazzino}
            </li>
            {/* Altri dettagli se disponibili */}
          </ul>
        </div>
      </div>

      {/* TABELLA PANTONI DEL GRUPPO */}
      <Table items={pantoniDelGruppo} config={DEFAULT_COLS} tableKey="ricettario" />
    </div>
  );
}
