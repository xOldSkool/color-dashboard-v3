import { DeliverPantoneParams, Pantone } from '@/types/pantoneTypes';
import axios from 'axios';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export function useCreatePantone() {
  const createPantone = async (pantone: Pantone): Promise<Pantone | undefined> => {
    try {
      const response = await axios.post<{ message: string; id: string }>('/api/pantoni', pantone);
      toast.success('Pantone creato con successo!');
      return { ...pantone, _id: response.data.id } as Pantone;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data?.error || 'Errore creazione Pantone';
        toast.error(msg);
      } else {
        toast.error('Errore di rete o server');
      }
      return undefined;
    }
  };
  return { createPantone };
}

export function useUpdatePantone() {
  const updatePantone = async (id: string, fields: Partial<Omit<Pantone, '_id'>>) => {
    const response = await axios.patch<Pantone>('/api/pantoni', { id, ...fields });
    return response.data;
  };
  return { updatePantone };
}

export function useDeletePantone() {
  const removePantone = async (ids: string | string[]): Promise<{ success: boolean }> => {
    try {
      const response = await axios.delete<{ success: boolean }>('/api/pantoni', {
        data: Array.isArray(ids) ? { ids } : { id: ids },
      });
      toast.success('Pantone eliminato con successo!');
      return response.data;
    } catch (error) {
      toast.error(`Errore durante l\'eliminazione del Pantone: ${error}`);
      return { success: false };
    }
  };
  return { removePantone };
}

export function useProducePantone() {
  const producePantone = async ({ pantoneId, battute, urgente }: { pantoneId: string; battute: number; urgente: boolean }) => {
    const response = await axios.put('/api/pantoni', { pantoneId, battute, urgente });
    return response.data;
  };
  return { producePantone };
}

export function useUndoProducePantone() {
  const undoProducePantone = async (pantoneId: string) => {
    const response = await axios.post('/api/pantoni/undo-produce', { pantoneId });
    return response.data;
  };
  return { undoProducePantone };
}

export function useDeliverPantone() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliverPantone = useCallback(async (params: DeliverPantoneParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/magazzinoPantoni/consegna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
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

  return { deliverPantone, loading, error };
}
