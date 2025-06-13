import { useState, useEffect, useRef, useCallback } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useUpdatePantone } from '@/hooks/usePantone';
import { useLoadPantone } from '@/hooks/useLoadPantone';
import { usePantoneMateriali } from '@/hooks/useMateriali';
import { useUpdateMagazzinoPantoni, useMagazzinoPantoni } from '@/hooks/useMagazzinoPantoni';
import { Pantone } from '@/types/pantoneTypes';
import { useRouter } from 'next/navigation';

interface ReturnPantoneFormProps {
  pantone: Pantone;
  onSuccess?: () => void;
}

type FormDataState = { qtRientro: string };

export default function ReturnPantoneForm({ pantone, onSuccess }: ReturnPantoneFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>({ qtRientro: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { updatePantone } = useUpdatePantone();
  const { loadPantone } = useLoadPantone();
  const { pantoneMateriali } = usePantoneMateriali();
  const { updateMagazzinoPantoni } = useUpdateMagazzinoPantoni();
  const { magazzinoPantone } = useMagazzinoPantoni({
    pantoneGroupId: pantone.pantoneGroupId,
    tipo: pantone.tipo,
  });
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const qtConsegnataProduzione = pantone.qtConsegnataProduzione || 0;

  useEffect(() => {
    const isValid = !!formData.qtRientro && Number(formData.qtRientro) > 0 && Number(formData.qtRientro) <= qtConsegnataProduzione;
    useModalStore.getState().setFormValid('returnPantone', isValid);
  }, [formData, qtConsegnataProduzione]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ qtRientro: value.replace(',', '.') });
  };

  const submit = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const quantita = Number(formData.qtRientro);
    if (!quantita || quantita <= 0 || quantita > qtConsegnataProduzione) {
      setErrorMessage('Quantità non valida');
      setLoading(false);
      return false;
    }
    // --- LOGICA: se rientro parziale, apri modale ReturnPantonePartialModal ---
    if (quantita < qtConsegnataProduzione) {
      useModalStore.getState().openModal('returnPantonePartial', {
        pantone,
        quantita,
        onSuccess,
      });
      setLoading(false);
      return false;
    }
    // --- Rientro totale: aggiorna Pantone, Materiale e MagazzinoPantoni tramite API centralizzata ---
    try {
      await updatePantone(String(pantone._id), {
        consegnatoProduzione: false,
        qtConsegnataProduzione: 0,
      });
      const basePantone = pantone.basi?.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'));
      if (basePantone) {
        const materiale = pantoneMateriali.find((m) => m.nomeMateriale === basePantone.nomeMateriale && m.fornitore === basePantone.fornitore);
        if (!materiale) {
          setErrorMessage('Materiale associato non trovato');
          setLoading(false);
          return false;
        }
        const result = await loadPantone({
          materialeId: String(materiale._id),
          nomeMateriale: materiale.nomeMateriale,
          fornitore: materiale.fornitore,
          quantita,
          causale: 'Rientro produzione',
        });
        if (!result.success) {
          setErrorMessage('Errore magazzino/materiali: ' + result.error);
          setLoading(false);
          return false;
        }
      }
      // --- Aggiorna anche il magazzino Pantoni ---
      const dispMagazzino = magazzinoPantone?.dispMagazzino ?? 0;
      await updateMagazzinoPantoni({
        pantoneGroupId: pantone.pantoneGroupId,
        tipo: pantone.tipo,
        dispMagazzino: dispMagazzino + quantita,
        ultimoUso: new Date().toISOString(),
        movimento: {
          tipo: 'carico',
          quantita,
          data: new Date().toISOString(),
          causale: 'Rientro da produzione',
        },
      });
      if (onSuccess) onSuccess();
      router.refresh();
      return true;
    } catch {
      setErrorMessage('Errore durante il rientro');
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    qtConsegnataProduzione,
    pantone,
    onSuccess,
    updatePantone,
    router,
    loadPantone,
    pantoneMateriali,
    magazzinoPantone,
    updateMagazzinoPantoni,
  ]);

  const reset = useCallback(() => {
    setFormData({ qtRientro: '' });
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);
  useEffect(() => {
    useModalStore.getState().registerHandler('returnPantone', {
      submit: () => submitRef.current?.() ?? Promise.resolve(false),
      reset: () => resetRef.current?.(),
    });
  }, []);

  return (
    <form className="flex flex-col gap-4 text-lg text-[var(--text)]" onSubmit={(e) => e.preventDefault()}>
      {errorMessage && <div className="text-red-500 whitespace-pre-line">{errorMessage}</div>}
      <p>
        <strong>Quantità consegnata in produzione:</strong> {qtConsegnataProduzione} kg
      </p>
      <input
        id="qtRientro"
        name="qtRientro"
        type="number"
        min={0}
        max={qtConsegnataProduzione}
        className="border p-2 rounded bg-[var(--background)]"
        placeholder="Inserisci quantità da rientrare"
        value={formData.qtRientro}
        onChange={handleChange}
        disabled={loading}
        autoFocus
      />
    </form>
  );
}
