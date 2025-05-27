import { Pantone } from '@/types/pantoneTypes';
import axios from 'axios';

export function useCreatePantone() {
  const create = async (pantone: Pantone): Promise<Pantone> => {
    const response = await axios.post<Pantone>('/api/pantoni', pantone);
    return response.data;
  };
  return { create };
}

export function useUpdatePantone() {
  const update = async (id: string, fields: Partial<Omit<Pantone, '_id'>>) => {
    const response = await axios.patch<Pantone>('/api/pantoni', { id, ...fields });
    return response.data;
  };
  return { update };
}

export function useDeletePantone() {
  const remove = async (ids: string | string[]): Promise<{ success: boolean }> => {
    const response = await axios.delete<{ success: boolean }>('/api/pantoni', {
      data: Array.isArray(ids) ? { ids } : { id: ids },
    });
    return response.data;
  };
  return { remove };
}
