import Button from '@/components/Button';
import TableClient from '@/components/Tables/Table';
import { CONFIG_SCHEDA_PANTONE } from '@/constants/defaultColumns';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllPantoni } from '@/lib/pantoni/db';
import { normalizePantoni } from '@/lib/transformJSON';

export default async function PantonePage({ params }) {
  const db = await connectToDatabase();
  const raw = await getAllPantoni(db);
  const pantoni = normalizePantoni(raw);
  const pantone = pantoni.find((p) => p._id === params.id);

  if (!pantone) return <p>Pantone non trovato</p>;

  return (
    <div className="p-6 mx-auto">
      {/* INTESTAZIONE */}
      <div className="flex flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-medium">
          Scheda pantone <span className="font-bold">{pantone.nomePantone}</span>
        </h1>
        <div className="flex flex-row gap-2 justify-end">
          <Button
            iconName="Send"
            variant="primary"
            // onClick={handleDeliverClick}
          >
            Consegna
          </Button>
          <Button
            iconName="PaintBucket"
            variant="primary"
            // onClick={handleProduceClick}
          >
            Componi
          </Button>
          <Button
            iconName="SquarePen"
            variant="secondary"
            // onClick={handleEditClick}
          >
            Modifica
          </Button>
          <Button
            iconName="Trash2"
            variant="danger"
            // onClick={handleDeleteClick}
          >
            Elimina
          </Button>
        </div>
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
                {pantone.ultimoUso}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Data creazione:</span>
                {pantone.dataCreazione}
              </li>
              <li className="flex flex-row gap-2">
                <span className="font-bold">Disponibilità magazzino:</span>
                {pantone.dispMagazzino} kg
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
              {pantone.basi.map(({ nome, label, valore }) => (
                <div key={nome}>
                  {valore > 0 ? (
                    <div>
                      <span className="font-semibold">{label}: </span>
                      <span>{valore} kg</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <h2 className="text-3xl font-semibold mb-2">Note</h2>
            <h3 className="text-xl">Note articolo</h3>
            <div className="bg-[var(--hover-btn-ghost)] rounded-lg text-lg p-1">{pantone.noteArticolo}</div>
            <h3 className="text-xl">Note colore</h3>
            <div className="bg-[var(--hover-btn-ghost)] rounded-lg text-lg p-1">{pantone.noteColore}</div>
            <h3 className="text-xl">Note magazzino</h3>
            <div className="bg-[var(--hover-btn-ghost)] rounded-lg text-lg p-1">{pantone.noteMagazzino}</div>
          </div>
        </div>
      </div>

      {/* TABELLA CON nomePantone UGUALE */}
      <TableClient
        config={CONFIG_SCHEDA_PANTONE}
        tableKey="scheda-pantone"
        rows={10}
        items={pantoni.filter((p) => p.nomePantone === pantone.nomePantone && p._id !== pantone._id)}
      />
    </div>
  );
}
