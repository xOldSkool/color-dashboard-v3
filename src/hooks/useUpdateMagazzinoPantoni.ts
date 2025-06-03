import axios from 'axios';
import { MagazzinoPantoni, MovimentoMagazzino } from '@/types/magazzinoPantoneTypes';

export function useUpdateMagazzinoPantoni() {
  const updateMagazzinoPantoni = async (fields: Partial<MagazzinoPantoni> & { movimento?: MovimentoMagazzino }) => {
    const response = await axios.patch('/api/magazzinoPantoni', fields);
    return response.data;
  };
  return { updateMagazzinoPantoni };
}
