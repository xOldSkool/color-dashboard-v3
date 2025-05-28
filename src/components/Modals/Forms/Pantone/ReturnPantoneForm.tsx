import { Pantone } from '@/types/pantoneTypes';

interface ReturnFormProps {
  pantone: Pantone;
}

export default function ReturnPantoneForm({ pantone }: ReturnFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <p>
        <strong>Pantone:</strong> {pantone.nomePantone}
      </p>
      <p>
        <strong>Quantità precedentemente consegnata:</strong> {pantone.qtConsegnataProduzione ?? 0}
      </p>
      <input
        id="qtRientro"
        type="number"
        min={0}
        className="border p-2 rounded bg-[var(--background)]"
        placeholder="Inserisci quantità da rientrare"
      />
    </div>
  );
}
