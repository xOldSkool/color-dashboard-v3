import { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseMateriale, Materiale, MovimentoMateriale } from '@/types/materialeTypes';
import { toast } from 'react-toastify';

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
    try {
      const response = await axios.post<Materiale>('/api/materiali', materiale);
      toast.success('Materiale creato con successo!');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data?.error || 'Errore creazione materiale';
        toast.error(msg);
      } else {
        toast.error('Errore di rete o server');
      }
      throw error;
    }
  };
  return { createMateriale };
}

export function useUpdateMateriale() {
  // Aggiorna materiale passando SOLO il movimento e la nuova quantità
  const updateMateriale = async (id: string, movimento: MovimentoMateriale, nuovaQuantita: number) => {
    try {
      await axios.patch<Materiale>(`/api/materiali/`, { id, movimento, quantita: nuovaQuantita });
      // Gestione toast dedicata per carico e scarico
      if (movimento.tipo === 'carico') {
        toast.success('Materiale caricato con successo!');
      } else if (movimento.tipo === 'scarico') {
        toast.success('Materiale scaricato con successo!');
      } else {
        toast.success('Materiale aggiornato con successo!');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data?.error || 'Errore aggiornamento materiale';
        toast.error(msg);
      } else {
        toast.error('Errore di rete o server');
      }
      throw error;
    }
  };
  return { updateMateriale };
}

export function useUpdateMaterialeCompleto() {
  const updateMaterialeCompleto = async (id: string, materiale: Omit<Materiale, '_id'>) => {
    try {
      await axios.patch(`/api/materiali/`, { id, ...materiale, fullUpdate: true });
      toast.success('Materiale aggiornato con successo!');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data?.error || 'Errore aggiornamento materiale';
        toast.error(msg);
      } else {
        toast.error('Errore di rete o server');
      }
      throw error;
    }
  };
  return { updateMaterialeCompleto };
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
