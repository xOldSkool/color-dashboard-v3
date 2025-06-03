import { Pantone } from '@/types/pantoneTypes';
import axios from 'axios';

export function useCreatePantone() {
  const createPantone = async (pantone: Pantone): Promise<Pantone> => {
    const response = await axios.post<Pantone>('/api/pantoni', pantone);
    return response.data;
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
    const response = await axios.delete<{ success: boolean }>('/api/pantoni', {
      data: Array.isArray(ids) ? { ids } : { id: ids },
    });
    return response.data;
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
