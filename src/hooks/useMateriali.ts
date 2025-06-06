import { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseMateriale, Materiale } from '@/types/materialeTypes';

export const useBasiMateriali = (tipo?: string) => {
  const [basi, setBasi] = useState<BaseMateriale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tipo) {
      setBasi([]);
      return;
    }

    const fetchBasi = async () => {
      setLoading(true);
      try {
        const response = await axios.get<BaseMateriale[]>(`/api/materiali?tipo=${encodeURIComponent(tipo)}`);
        const data = response.data.map((m) => ({
          nomeMateriale: m.nomeMateriale,
          label: m.label || m.nomeMateriale,
          codiceColore: m.codiceColore,
          codiceFornitore: m.codiceFornitore,
          fornitore: m.fornitore,
          tipo: m.tipo,
          stato: m.stato,
          utilizzo: m.utilizzo,
          quantita: m.quantita,
          _id: m._id,
        }));
        setBasi(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Errore nel recupero delle basi');
      } finally {
        setLoading(false);
      }
    };

    fetchBasi();
  }, [tipo]);

  return { basi, loading, error };
};

export function useCreateMateriale() {
  const createMateriale = async (materiale: Materiale): Promise<Materiale> => {
    const response = await axios.post<Materiale>('/api/materiali', materiale);
    return response.data;
  };
  return { createMateriale };
}

export function useUpdateMateriale() {
  const updateMateriale = async (id: string, updateData: Partial<Omit<Materiale, '_id'>>) => {
    await axios.patch<Materiale>(`/api/materiali/`, { id, ...updateData });
  };
  return { updateMateriale };
}

export function usePantoneMateriali() {
  const [pantoneMateriali, setPantoneMateriali] = useState<Materiale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPantoneMateriali = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Materiale[]>('/api/materiali?utilizzo=Pantone');
        setPantoneMateriali(response.data);
        setError(null);
      } catch {
        setError('Errore nel recupero dei pantoni esterni');
      } finally {
        setLoading(false);
      }
    };
    fetchPantoneMateriali();
  }, []);

  return { pantoneMateriali, loading, error };
}
