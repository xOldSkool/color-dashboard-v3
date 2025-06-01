import { Pantone } from '@/types/pantoneTypes';
import { MagazzinoPantoni } from '@/types/magazzinoPantoneTypes';

export function mergePantoniMagazzino(pantoni: Pantone[], magazzinoPantoni: MagazzinoPantoni[]) {
  return pantoni.map((p) => {
    const mag = magazzinoPantoni.find((m) => m.pantoneGroupId === p.pantoneGroupId);
    return { ...p, dispMagazzino: mag?.dispMagazzino ?? 0, count: mag?.count ?? 0 };
  });
}
