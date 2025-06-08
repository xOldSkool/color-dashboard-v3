'use client';
import { Pantone } from '@/types/pantoneTypes';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useProducePantone } from '@/hooks/usePantone';
import { useMagazzinoPantoni } from '@/hooks/useMagazzinoPantoni';
import { calcolaProduzionePantone } from '@/lib/pantoni/calcoli';
import { useModalStore } from '@/store/useModalStore';
import { useRouter } from 'next/navigation';

interface ProduceFormProps {
  pantone: Pantone;
  onSuccess?: () => void;
}

type BasiRisultato = {
  nomeMateriale: string;
  label: string;
  codiceFornitore: string;
  codiceColore: string;
  tipo: string;
  quantita: number;
  fornitore: string;
  kgRichiesti: number;
};

export default function ProducePantoneForm({ pantone, onSuccess }: ProduceFormProps) {
  const [battute, setBattute] = useState(0);
  const [urgente, setUrgente] = useState(false);
  const [result, setResult] = useState<null | { kgTotali: number; nDosi: number; basiRisultato: BasiRisultato[]; success: boolean }>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ basiNonDisponibili?: { nomeMateriale: string; richiesti: number }[] } | null>(null);
  const { producePantone } = useProducePantone();
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();

  const submitRef = useRef<() => Promise<boolean> | undefined>(undefined);
  const resetRef = useRef<() => void | undefined>(undefined);

  const submit = useCallback(async () => {
    setError(null);
    setErrorDetails(null);
    setResult(null);
    try {
      const res = await producePantone({ pantoneId: pantone._id as string, battute, urgente });
      if (res.success) {
        setResult(res);
        router.refresh();
        if (onSuccess) onSuccess();
        return true;
      } else {
        setError(res.error || 'Errore generico');
        setErrorDetails(res.basiNonDisponibili ? { basiNonDisponibili: res.basiNonDisponibili } : null);
        return false;
      }
    } catch (err) {
      let errorMsg = 'Errore generico';
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string; basiNonDisponibili?: { nomeMateriale: string; richiesti: number }[] } } }).response
          ?.data?.error === 'string'
      ) {
        errorMsg = (err as { response: { data: { error: string; basiNonDisponibili?: { nomeMateriale: string; richiesti: number }[] } } }).response
          .data.error;
        setErrorDetails(
          (err as { response: { data: { basiNonDisponibili?: { nomeMateriale: string; richiesti: number }[] } } }).response.data.basiNonDisponibili
            ? {
                basiNonDisponibili: (err as { response: { data: { basiNonDisponibili: { nomeMateriale: string; richiesti: number }[] } } }).response
                  .data.basiNonDisponibili,
              }
            : null
        );
      }
      setError(errorMsg);
      return false;
    }
  }, [battute, urgente, onSuccess, producePantone, pantone._id, router]);

  const reset = useCallback(() => {
    setBattute(0);
    setUrgente(false);
    setResult(null);
    setError(null);
    setErrorDetails(null);
  }, []);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);

  useEffect(() => {
    useModalStore.getState().registerHandler('producePantone', {
      submit: () => (submitRef.current ? Promise.resolve(submitRef.current()) : Promise.resolve(false)),
      reset: () => resetRef.current?.(),
    });
  }, []);

  const { magazzinoPantone, loading: loadingMagazzino } = useMagazzinoPantoni({ pantoneGroupId: pantone.pantoneGroupId, tipo: pantone.tipo });
  const dispMagazzino = magazzinoPantone?.dispMagazzino ?? null;

  const basiFiltrate = useMemo(() => {
    if (!pantone?.basi || !Array.isArray(pantone.basi)) return [];
    return pantone.basi.filter((b) => b.quantita > 0);
  }, [pantone]);

  const { kgTotali, nDosi, basiRisultato } = useMemo(() => {
    return calcolaProduzionePantone({
      consumo: pantone.consumo,
      dose: pantone.dose,
      battute,
      dispMagazzino: dispMagazzino || 0,
      basi: pantone.basi || [],
    });
  }, [pantone.consumo, pantone.dose, battute, dispMagazzino, pantone.basi]);

  const risultati = basiRisultato.map((b) => ({
    ...b,
    totale: b.kgRichiesti,
  }));

  if (!pantone || !Array.isArray(pantone.basi)) {
    return <p className="text-red-500">Pantone non valido o incompleto</p>;
  }

  const onUrgenteChange = (e: React.ChangeEvent<HTMLInputElement>) => setUrgente(e.target.checked);

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-6 text-lg text-[var(--text)]"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div>
        <span className="font-semibold">Disponibilità magazzino:</span>{' '}
        <span className="underline">{loadingMagazzino ? '...' : dispMagazzino !== null ? dispMagazzino + ' kg' : '-'}</span>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-xl">
          Quantità per 1000 battute: <span className="underline">{pantone.dose.toFixed(3)} kg</span>
        </h3>
        <ul className="space-y-1">
          {basiFiltrate.map((b) => (
            <li key={b.nomeMateriale} className="flex justify-between">
              <span>{b.label}</span>
              <span>{b.quantita} kg</span>
            </li>
          ))}
        </ul>
      </div>
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
      <label className="flex items-center space-x-2">
        <input id="urgente" type="checkbox" checked={urgente} onChange={onUrgenteChange} className="h-4 w-4 rounded" />
        <span>Urgente</span>
      </label>
      <div>
        <h3 className="font-semibold mb-2 text-xl">
          Totale quantità da preparare: <span className="underline">{kgTotali.toFixed(3)} kg</span>
        </h3>
        <div className="text-base mb-2">
          N° dosi: <span className="underline">{nDosi.toFixed(2)}</span>
        </div>
        <ul className="space-y-1">
          {risultati.map((b) => (
            <li key={b.nomeMateriale} className="flex justify-between">
              <span>{b.label}</span>
              <span>{b.totale} kg</span>
            </li>
          ))}
        </ul>
      </div>
      {error && (
        <div className="text-red-500 font-semibold">
          {error}
          {errorDetails?.basiNonDisponibili && (
            <ul className="mt-2 text-sm font-normal">
              {errorDetails.basiNonDisponibili.map((b) => (
                <li key={b.nomeMateriale}>
                  {b.nomeMateriale}: manca {b.richiesti} kg
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {result && (
        <div className="text-green-500 font-semibold">
          Pantone pronto da produrre! Kg totali: {result.kgTotali} | N° dosi: {result.nDosi}
        </div>
      )}
    </form>
  );
}
