import { useEffect, useState } from 'react';
import axios from 'axios';
import { MagazzinoPantoni, MovimentoMagazzino } from '@/types/magazzinoPantoneTypes';
import { toast } from 'react-toastify';

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

export function useUpdateMagazzinoPantoni() {
  const updateMagazzinoPantoni = async (fields: Partial<MagazzinoPantoni> & { movimento?: MovimentoMagazzino }) => {
    try {
      const response = await axios.patch('/api/magazzinoPantoni', fields);
      toast.success('Magazzino aggiornato con successo!');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data?.error || 'Errore aggiornamento magazzino';
        toast.error(msg);
      } else {
        toast.error('Errore di rete o server');
      }
      throw error;
    }
  };
  return { updateMagazzinoPantoni };
}
