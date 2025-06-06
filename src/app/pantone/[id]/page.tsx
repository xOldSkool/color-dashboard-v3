export const dynamic = 'force-dynamic';
import { CONFIG_SCHEDA_PANTONE } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllPantoni } from '@/lib/pantoni/db';
import { normalizePantoni } from '@/lib/normalizers';
import Table from '@/components/Tables/Table';
import PantoneActions from './actions';
import { getAllMagazzinoPantoni } from '@/lib/magazzinoPantoni/db';
import { H1 } from '@/components/UI/Titles&Texts';

export default async function PantonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  const pantone = pantoni.find((p) => p._id === id);
  const magazzinoPantoni = await getAllMagazzinoPantoni(db);
  const magazzino = magazzinoPantoni.find((m) => m.pantoneGroupId === pantone?.pantoneGroupId && m.tipo === pantone?.tipo);

  if (!pantone) return <p>Pantone non trovato. Contattare lo sviluppatore!</p>;

  return (
    <div className="p-6 mx-auto">
      {/* INTESTAZIONE */}
      <div className="flex flex-row justify-between items-center mb-10">
        <H1>
          Scheda pantone <span className="font-bold">{pantone.nomePantone}</span>
        </H1>
        <PantoneActions pantone={pantone} />
      </div>

      <div className="flex flex-col mb-5">
        {/* DETTAGLI PANTONE */}
        <div className="flex flex-row gap-4 items-center border border-dashed border-[var(--border)] rounded-xl shadow-lg shadow-white/10 p-4">
          <div className="h-54 w-54 rounded-xl" style={{ backgroundColor: pantone.hex }}></div>
          <div className="flex flex-col  self-start ml-10">
            <ul className="text-xl">
              <li className="flex flex-row gap-2 ">
                <span className="font-bold">Cliente:</span>
                {pantone.cliente}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Variante:</span>
                {pantone.variante}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Tipo:</span>
                {pantone.tipo === 'EB' ? <span>{pantone.tipo}</span> : <span className="text-purple-600">{pantone.tipo}</span>}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Articolo:</span>
                {pantone.articolo}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">IS:</span>
                {pantone.is}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Stato:</span>
                {pantone.stato}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Consumo:</span>
                {pantone.consumo} kg
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Dose:</span>
                {pantone.dose} kg
              </li>
            </ul>
          </div>
          <div className="flex flex-col self-start ml-10">
            <ul className="text-xl">
              <li className="flex flex-row gap-2">
                <span className="font-bold">Carta:</span>
                {pantone.tipoCarta} - {pantone.fornitoreCarta}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Passo:</span>
                {pantone.passoCarta}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Altezza:</span>
                {pantone.hCarta}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Ultimo uso:</span>
                {new Date(pantone.ultimoUso).toLocaleString('it-IT').replace(',', ' -')}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Data creazione:</span>
                {new Date(pantone.dataCreazione).toLocaleString('it-IT').replace(',', ' -')}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Disponibilità magazzino:</span>
                {magazzino?.dispMagazzino} kg
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Descrizione:</span>
                {pantone.descrizione}
              </li>
            </ul>
          </div>
        </div>

        {/* RICETTA E NOTE */}
        <div className="grid grid-cols-2 mt-10 border border-dashed border-[var(--border)] rounded-xl shadow-lg shadow-white/10 p-4">
          <div className="grid">
            <h2 className="text-3xl font-semibold mb-2">Ricetta</h2>
            <div className="flex flex-col text-xl">
              {pantone.basi?.map(({ nomeMateriale, label, quantita }, idx) => (
                <div key={nomeMateriale ?? idx}>
                  {quantita > 0 ? (
                    <div>
                      <span className="font-semibold">{label}: </span>
                      <span>{quantita} kg</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <h2 className="text-3xl font-semibold mb-2">Note</h2>
            {pantone?.noteArticolo?.trim() && (
              <>
                <h3 className="text-xl">Note articolo</h3>
                <div className="bg-[var(--hover-btn-ghost)] rounded-lg text-lg p-2">{pantone.noteArticolo}</div>
              </>
            )}
            {pantone?.noteColore?.trim() && (
              <>
                <h3 className="text-xl">Note colore</h3>
                <div className="bg-[var(--hover-btn-ghost)] rounded-lg text-lg p-2">{pantone.noteColore}</div>
              </>
            )}
            {magazzino?.noteMagazzino?.trim() && (
              <>
                <h3 className="text-xl">Note magazzino</h3>
                <div className="bg-[var(--hover-btn-ghost)] rounded-lg text-lg p-2">{magazzino.noteMagazzino}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TABELLA CON nomePantone UGUALE */}
      <Table
        config={CONFIG_SCHEDA_PANTONE}
        tableKey="scheda-pantone"
        rows={10}
        items={pantoni.filter((p) => p.pantoneGroupId === pantone.pantoneGroupId && p._id !== pantone._id)}
      />
    </div>
  );
}
