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
