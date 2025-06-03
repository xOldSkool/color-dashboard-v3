import { useState, useEffect, useRef } from 'react';
import { useUndoProducePantone } from '@/hooks/usePantone';
import { useModalStore } from '@/store/useModalStore';
import { Pantone } from '@/types/pantoneTypes';
import { useRouter } from 'next/navigation';

interface RemoveFromToProduceFormProps {
  pantone: Pantone;
  onSuccess?: () => void;
}

export default function RemoveFromToProduceForm({ pantone, onSuccess }: RemoveFromToProduceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { undoProducePantone } = useUndoProducePantone();
  const router = useRouter();

  // Ref per evitare ciclo infinito
  const pantoneRef = useRef(pantone);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    pantoneRef.current = pantone;
    onSuccessRef.current = onSuccess;
  }, [pantone, onSuccess]);

  useEffect(() => {
    useModalStore.getState().registerHandler('removeFromToProduce', {
      submit: async () => {
        setError(null);
        setSuccess(false);
        setIsLoading(true);
        try {
          const res = await undoProducePantone(pantoneRef.current._id as string);
          if (res.success) {
            setSuccess(true);
            router.refresh();
            if (onSuccessRef.current) onSuccessRef.current();
            // Chiudi la modale dopo successo
            useModalStore.getState().closeModal('removeFromToProduce');
          } else {
            setError(res.error || 'Errore generico');
          }
        } catch {
          setError('Errore generico');
        } finally {
          setIsLoading(false);
        }
        return isLoading;
      },
      reset: () => {
        setError(null);
        setSuccess(false);
      },
    });
    // SOLO al mount!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <form className="flex flex-col gap-4 text-lg text-[var(--text)]">
      <div>
        Vuoi annullare la produzione per il Pantone <span className="font-semibold">{pantone.nomePantone}</span>?
      </div>
      {error && <div className="text-red-500 font-semibold">{error}</div>}
      {success && <div className="text-green-500 font-semibold">Produzione annullata con successo!</div>}
    </form>
  );
}
