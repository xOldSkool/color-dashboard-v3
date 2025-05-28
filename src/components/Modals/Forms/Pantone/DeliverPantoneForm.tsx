import { Pantone } from '@/types/pantoneTypes';

interface DeliverFormProps {
  pantone: Pantone;
}

export default function DeliverPantoneForm({ pantone }: DeliverFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <p>
        <strong>Quantità disponibile a magazzino:</strong> {/*{pantone.dispMagazzino} */}
      </p>
      <input
        id="qtConsegnata"
        type="number"
        min={0}
        className="border p-2 rounded bg-[var(--background)]"
        placeholder="Inserisci quantità da consegnare"
      />
    </div>
  );
}
