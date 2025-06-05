import { Table } from '@/components/ClientWrapper';
import { H1, H2 } from '@/components/UI/Titles&Texts';
import { CONFIG_MOVIMENTI_MAGAZZINO_PANTONE, CONFIG_SCHEDA_PANTONE } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { aggregateMagazzinoPantoni } from '@/lib/magazzinoPantoni/logic';
import { normalizePantoni } from '@/lib/normalizers';
import { getAllPantoni } from '@/lib/pantoni/db';

export default async function MagazzinoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  const magazzinoPantoni = await aggregateMagazzinoPantoni(db);
  // Recupera anche i movimenti dal documento magazzinoPantoni originale
  const magazzinoRaw = await db.collection('magazzinoPantoni').find().toArray();
  const gruppoRaw = magazzinoRaw.find((m) => m.pantoneGroupId === id);
  const gruppo = magazzinoPantoni.find((g) => g.pantoneGroupId === id);
  const pantoniDelGruppo = pantoni.filter((p) => p.pantoneGroupId === id);
  const hex = pantoniDelGruppo[0]?.hex;

  if (!gruppo) return <p>Gruppo magazzino non trovato. Contattare lo sviluppatore!</p>;

  return (
    <div className="p-6 mx-auto">
      {/* INTESTAZIONE */}
      <div className="flex flex-row justify-between items-center mb-10">
        <H1>
          Scheda magazzino <span className="font-bold">{gruppo.nomePantone || gruppo.pantoneGroupId}</span>
        </H1>
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
            <li className="flex flex-row gap-2">
              <span className="font-semibold">Dose:</span>
              {pantoniDelGruppo[0].dose} kg
            </li>
            {/* Altri dettagli se disponibili */}
          </ul>
        </div>
      </div>

      {/* TABELLA PANTONI DEL GRUPPO */}
      <Table items={pantoniDelGruppo} config={CONFIG_SCHEDA_PANTONE} tableKey="ricettario" />

      {/* TABELLA MOVIMENTI MAGAZZINO */}
      {Array.isArray(gruppoRaw?.movimenti) && gruppoRaw.movimenti.length > 0 && (
        <div className="mt-10">
          <H2>Movimenti</H2>
          <Table
            items={gruppoRaw.movimenti.map((mov, idx) => ({ ...mov, _id: `${gruppoRaw._id ?? gruppoRaw.pantoneGroupId}_mov_${idx}` }))}
            config={CONFIG_MOVIMENTI_MAGAZZINO_PANTONE}
            tableKey="movimenti-magazzino"
            rows={10}
          />
        </div>
      )}
    </div>
  );
}
