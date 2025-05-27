import Button from '@/components/Button';
import { connectToDatabase } from '@/lib/connectToMongoDb';
import { getAllMateriali } from '@/lib/materiali';
import { normalizeMateriali } from '@/lib/normalizers';

export default async function MaterialePage({ params }) {
  const id = params.id;
  const db = await connectToDatabase();
  const raw = await getAllMateriali(db);
  const materiali = normalizeMateriali(raw);

  const materiale = materiali.find((mat) => mat._id === id);
  if (!materiale) return <p>Materiale non trovato</p>;

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-medium">
          Scheda materiale <span className="font-bold">{materiale.label}</span>
        </h1>
        <div className="flex flex-row gap-2">
          <Button modalKey="loadMateriale" iconName="loadin" variant="primary">
            Carico
          </Button>
          <Button modalKey="unloadMateriale" iconName="loadout" variant="primary">
            Scarico
          </Button>
        </div>
      </div>

      <div className="border border-dashed border-[var(--border)] rounded-xl shadow-lg p-6 text-xl space-y-4">
        <p>
          <span className="font-bold">Codice colore:</span> {materiale.codiceColore}
        </p>
        <p>
          <span className="font-bold">Quantità:</span> {materiale.quantita} kg
        </p>
        <p>
          <span className="font-bold">Fornitore:</span> {materiale.fornitore}
        </p>
        <p>
          <span className="font-bold">Tipo:</span> {materiale.tipo}
        </p>
        <p>
          <span className="font-bold">Note:</span> {materiale.noteMateriale}
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-2">Movimenti</h2>
        {materiale.movimenti?.length ? (
          <ul className="space-y-2">
            {materiale.movimenti.map((mov, index) => (
              <li key={index} className="bg-[var(--hover-btn-ghost)] p-3 rounded-lg text-lg">
                <strong>{mov.tipo}</strong> • {mov.quantita} kg • {new Date(mov.data).toLocaleDateString()}
                {mov.note && ` • ${mov.note}`}
                {mov.causale && `• ${mov.causale}`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg">Nessun movimento registrato</p>
        )}
      </div>
    </div>
  );
}
