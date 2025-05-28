'use client';
import { Pantone } from '@/types/pantoneTypes';
import { useState, useMemo } from 'react';

interface ProduceFormProps {
  pantone: Pantone;
}

export default function ProducePantoneForm({ pantone }: ProduceFormProps) {
  const [battute, setBattute] = useState(0);
  const [urgente, setUrgente] = useState(false);
  const basiFiltrate = useMemo(() => {
    if (!pantone?.basi || !Array.isArray(pantone.basi)) return [];
    return pantone.basi.filter((b) => b.quantita > 0);
  }, [pantone]);

  if (!pantone || !Array.isArray(pantone.basi)) {
    return <p className="text-red-500">Pantone non valido o incompleto</p>;
  }

  const onUrgenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrgente(e.target.checked);
  };

  const risultati = basiFiltrate.map((b) => ({
    ...b,
    totale: +((b.quantita * battute) / 1000).toFixed(3),
  }));

  const totaleKg = risultati.reduce((acc, b) => acc + b.totale, 0).toFixed(3);
  return (
    <div className="flex flex-col gap-6 text-lg text-[var(--text)]">
      {/* Quantità per 1000 battute */}
      <div>
        <h3 className="font-semibold mb-2 text-xl">
          Quantità per 1000 battute: <span className="underline">{pantone.dose.toFixed(3)} kg</span>
        </h3>
        <ul className="space-y-1">
          {basiFiltrate.map((b) => (
            <li key={b.name} className="flex justify-between">
              <span>{b.label}</span>
              <span>{b.quantita} kg</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Input battute*/}
      <label>
        Numero di battute:
        <input
          id="numerobattute"
          type="number"
          min={1}
          className="ml-2 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-500 text-white w-24"
          value={battute}
          onChange={(e) => setBattute(Number(e.target.value))}
        />
      </label>

      {/* Checkbox Urgente */}
      <label className="flex items-center space-x-2">
        <input id="urgente" type="checkbox" checked={urgente} onChange={onUrgenteChange} className="h-4 w-4 rounded" />
        <span>Urgente</span>
      </label>

      {/* Risultato calcolo */}
      <div>
        <h3 className="font-semibold mb-2 text-xl">
          Totale quantità da preparare: <span className="underline">{totaleKg} kg</span>
        </h3>
        <ul className="space-y-1">
          {risultati.map((b) => (
            <li key={b.name} className="flex justify-between">
              <span>{b.label}</span>
              <span>{b.totale} kg</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
