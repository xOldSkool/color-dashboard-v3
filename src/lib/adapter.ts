import { Materiale } from '@/types/materialeTypes';
import { Pantone } from '@/types/pantoneTypes';

export function pantoneToFormData(pantone: Pantone): Record<string, string | number | undefined> {
  const formData: Record<string, string | number | undefined> = {};

  Object.entries(pantone).forEach(([key, value]) => {
    if (value instanceof Date) formData[key] = value.toISOString();
    else if (typeof value === 'object' && value !== null && '_bsontype' in value) formData[key] = value.toString();
    else if (typeof value === 'string' || typeof value === 'number' || value === undefined) formData[key] = value;
    else formData[key] = String(value);
  });

  pantone.basi?.forEach((b) => {
    formData[`fornitore_${b.nomeMateriale}`] = b.fornitore;
    formData[`valore_${b.nomeMateriale}`] = b.quantita;
  });

  return formData;
}

export function materialeToFormData(materiale: Materiale): Record<string, string | number | undefined> {
  const formData: Record<string, string | number | undefined> = {};

  Object.entries(materiale).forEach(([key, value]) => {
    if (value instanceof Date) formData[key] = value.toISOString();
    else if (typeof value === 'object' && value !== null && '_bsontype' in value) formData[key] = value.toString();
    else if (typeof value === 'string' || typeof value === 'number' || value === undefined) formData[key] = value;
    else formData[key] = String(value);
  });

  return formData;
}
