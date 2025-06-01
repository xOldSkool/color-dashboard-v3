import { Pantone } from '@/types/pantoneTypes';
import { MagazzinoPantoni } from '@/types/magazzinoPantoneTypes';

export function raggruppaPantoni(pantoni: Pantone[], magazzinoPantoni: MagazzinoPantoni[]) {
  return magazzinoPantoni.map((group) => {
    const pantoniDelGruppo = pantoni.filter((p) => p.pantoneGroupId === group.pantoneGroupId);
    const primoPantone = pantoniDelGruppo[0] || {};
    return {
      ...group,
      ...primoPantone,
    };
  });
}
