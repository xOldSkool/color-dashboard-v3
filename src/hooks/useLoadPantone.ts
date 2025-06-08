import { useCallback, useState } from 'react';

interface LoadPantoneParams {
  materialeId: string;
  nomeMateriale: string;
  fornitore: string;
  quantita: number;
  causale?: string;
}

interface UseLoadPantoneResult {
  loadPantone: (params: LoadPantoneParams) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
}

export function useLoadPantone(): UseLoadPantoneResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPantone = useCallback(async (params: LoadPantoneParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/materiali/carico-scarico-pantone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialeId: params.materialeId,
          nomeMateriale: params.nomeMateriale,
          fornitore: params.fornitore,
          quantita: params.quantita,
          operazione: 'carico',
          causale: params.causale || 'Rientro produzione',
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.error || 'Errore sconosciuto');
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch {
      setError('Errore di rete o server');
      return { success: false, error: 'Errore di rete o server' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loadPantone, loading, error };
}
