import { useState, useEffect, useRef } from 'react';
import { useUpdatePantone } from '@/hooks/usePantone';
import { useUpdateMagazzinoPantoni } from '@/hooks/useMagazzinoPantoni';
import { useModalStore } from '@/store/useModalStore';
import { useRouter } from 'next/navigation';
import { Pantone } from '@/types/pantoneTypes';

interface MarkPantoneAsConsumedProps {
  pantone: Pantone;
}

export default function MarkPantoneAsConsumed({ pantone }: MarkPantoneAsConsumedProps) {
  const [error, setError] = useState<string | null>(null);
  const { updatePantone } = useUpdatePantone();
  const { updateMagazzinoPantoni } = useUpdateMagazzinoPantoni();
  const router = useRouter();
  const lastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (lastIdRef.current === String(pantone._id)) return;
    lastIdRef.current = String(pantone._id);
    useModalStore.getState().registerHandler('markPantoneAsConsumed', {
      submit: async () => {
        setError(null);
        try {
          await updatePantone(String(pantone._id), {
            consegnatoProduzione: false,
            qtConsegnataProduzione: 0,
          });
          await updateMagazzinoPantoni({
            pantoneGroupId: pantone.pantoneGroupId,
            tipo: pantone.tipo,
            ultimoUso: new Date().toISOString(),
          });
          router.refresh();
          return true;
        } catch {
          setError("Errore durante l'aggiornamento.");
          return false;
        }
      },
    });
  }, [pantone._id, pantone.pantoneGroupId, pantone.tipo, updatePantone, updateMagazzinoPantoni, router]);

  return (
    <div className="flex flex-col gap-4">
      <p>Confermi che tutta la quantità consegnata è stata consumata in produzione?</p>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
