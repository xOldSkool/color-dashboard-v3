import { useState, useEffect, useRef, useCallback } from 'react';
import { useMagazzinoPantoni } from '@/hooks/useMagazzinoPantoni';
import { useModalStore } from '@/store/useModalStore';
import { useUpdatePantone, useDeliverPantone } from '@/hooks/usePantone';
import { Pantone } from '@/types/pantoneTypes';
import { useRouter } from 'next/navigation';

interface DeliverFormProps {
  pantone: Pantone;
  onSuccess?: () => void;
}

type FormDataState = { qtConsegnata: string };

export default function DeliverPantoneForm({ pantone, onSuccess }: DeliverFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>({ qtConsegnata: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { magazzinoPantone, loading: loadingMag } = useMagazzinoPantoni({
    pantoneGroupId: pantone.pantoneGroupId,
    tipo: pantone.tipo,
  });
  const dispMagazzino = magazzinoPantone?.dispMagazzino ?? 0;
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const { updatePantone } = useUpdatePantone();
  const { deliverPantone } = useDeliverPantone();

  // Validazione form
  useEffect(() => {
    const isValid = !!formData.qtConsegnata && Number(formData.qtConsegnata) > 0 && Number(formData.qtConsegnata) <= dispMagazzino;
    useModalStore.getState().setFormValid('deliverPantone', isValid);
  }, [formData, dispMagazzino]);

  // Gestione change input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ qtConsegnata: value.replace(',', '.') });
  };

  // Submit logica
  const submit = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const quantita = Number(formData.qtConsegnata);
    if (!quantita || quantita <= 0 || quantita > dispMagazzino) {
      setErrorMessage('Quantità non valida');
      setLoading(false);
      return false;
    }
    try {
      // Aggiorna stato pantone (consegnatoProduzione)
      await updatePantone(String(pantone._id), {
        consegnatoProduzione: true,
        qtConsegnataProduzione: quantita,
      });
      // Chiamata API centralizzata tramite hook custom
      const result = await deliverPantone({
        pantoneId: String(pantone._id),
        pantoneGroupId: pantone.pantoneGroupId,
        tipo: pantone.tipo,
        quantita,
        causale: 'Uso produzione',
      });
      if (!result.success) {
        setErrorMessage('Errore magazzino/materiali: ' + result.error);
        setLoading(false);
        return false;
      }
      if (onSuccess) onSuccess();
      router.refresh();
      return true;
    } catch {
      setErrorMessage('Errore durante la consegna');
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, dispMagazzino, pantone, onSuccess, updatePantone, router, deliverPantone]);

  // Reset logica
  const reset = useCallback(() => {
    setFormData({ qtConsegnata: '' });
    setErrorMessage(null);
  }, []);

  // Registra submit/reset nello store modale
  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);
  useEffect(() => {
    useModalStore.getState().registerHandler('deliverPantone', {
      submit: () => submitRef.current?.() ?? Promise.resolve(false),
      reset: () => resetRef.current?.(),
    });
  }, []);

  return (
    <form className="flex flex-col gap-4 text-lg text-[var(--text)]" onSubmit={(e) => e.preventDefault()}>
      {errorMessage && <div className="text-red-500 whitespace-pre-line">{errorMessage}</div>}
      <p>
        <strong>Quantità disponibile a magazzino:</strong> {loadingMag ? '...' : dispMagazzino + ' kg'}
      </p>
      <input
        id="qtConsegnata"
        name="qtConsegnata"
        type="number"
        min={0}
        max={dispMagazzino}
        className="border p-2 rounded bg-[var(--background)]"
        placeholder="Inserisci quantità da consegnare"
        value={formData.qtConsegnata}
        onChange={handleChange}
        disabled={loadingMag || loading}
        autoFocus
      />
    </form>
  );
}
