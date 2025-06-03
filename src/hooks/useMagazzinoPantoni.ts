import { useEffect, useState } from 'react';
import axios from 'axios';
import { MagazzinoPantoni } from '@/types/magazzinoPantoneTypes';

interface UseMagazzinoPantoniProps {
  pantoneGroupId: string;
  tipo: string;
}

export function useMagazzinoPantoni({ pantoneGroupId, tipo }: UseMagazzinoPantoniProps) {
  const [magazzinoPantone, setMagazzinoPantone] = useState<MagazzinoPantoni | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pantoneGroupId || !tipo) return;
    setLoading(true);
    axios
      .get(`/api/magazzinoPantoni?pantoneGroupId=${pantoneGroupId}&tipo=${tipo}`)
      .then((res) => {
        setMagazzinoPantone(res.data || null);
        setError(null);
      })
      .catch(() => {
        setMagazzinoPantone(null);
        setError('Errore nel recupero magazzino');
      })
      .finally(() => setLoading(false));
  }, [pantoneGroupId, tipo]);

  return { magazzinoPantone, loading, error };
}
