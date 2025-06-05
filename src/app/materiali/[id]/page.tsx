export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllMateriali } from '@/lib/materiali/db';
import { normalizeMateriali, normalizeMovimenti } from '@/lib/normalizers';
import { getLogoByFornitore } from '@/utils/getLogoByFornitore';
import Image from 'next/image';
import MaterialeActions from './actions';
import { Table } from '@/components/ClientWrapper';
import { CONFIG_MOVIMENTI_MATERIALE } from '@/constants/defaultColumns';
import { H1, H2 } from '@/components/UI/Titles&Texts';

export default async function MaterialePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await connectToDatabase();
  const raw = await getAllMateriali(db);
  const materiali = normalizeMateriali(raw);

  const materiale = materiali.find((mat) => mat._id === id);
  if (!materiale) return <p>Materiale non trovato, contatta lo sviluppatore</p>;
  const logoSrc = materiale.fornitore ? getLogoByFornitore(materiale.fornitore) : null;
  const movimenti = normalizeMovimenti(materiale);

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-row justify-between items-center mb-10">
        <H1>
          Scheda materiale <span className="font-bold">{materiale.label}</span> - <span className="font-bold">{materiale.fornitore}</span>{' '}
          <span className="font-bold">{materiale.codiceColore}</span>
        </H1>
        <div className="flex flex-row gap-2">
          <MaterialeActions materiale={materiale} />
        </div>
      </div>

      <div className="flex items-center justify-between border border-dashed border-[var(--border)] rounded-xl shadow-lg p-6 text-xl space-y-4">
        <div>
          <p>
            <span className="font-semibold">Codice colore:</span> {materiale.codiceColore}
          </p>
          <p>
            <span className="font-semibold">Quantità:</span> {materiale.quantita} kg
          </p>
          <p>
            <span className="font-semibold">Fornitore:</span> {materiale.fornitore}
          </p>
          <p>
            <span className="font-semibold">Tipo:</span> {materiale.tipo}
          </p>
          <p>
            <span className="font-semibold">Note:</span> {materiale.noteMateriale ? materiale.noteMateriale : 'Nessuna nota presente'}
          </p>
          <p>
            <span className="font-semibold">Codice fornitore:</span> {materiale.codiceFornitore}
          </p>
          <p>
            <span className="font-semibold">Data creazione:</span> {new Date(materiale.dataCreazione).toLocaleString('it-IT').replace(',', ' -')}
          </p>
        </div>
        {materiale.fornitore && getLogoByFornitore(materiale.fornitore) && (
          <Image src={logoSrc!} alt={materiale.fornitore} className="h-auto" width={200} height={100} />
        )}
      </div>

      <div className="mt-10">
        <H2>Movimenti</H2>
        {materiale.movimenti?.length ? (
          <Table items={movimenti} config={CONFIG_MOVIMENTI_MATERIALE} tableKey="movimenti-materiale"></Table>
        ) : (
          <p className="text-lg">Nessun movimento registrato</p>
        )}
      </div>
    </div>
  );
}
