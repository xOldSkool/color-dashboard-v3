import { Materiale } from '@/types/materialeTypes';
import { Pantone } from '@/types/pantoneTypes';

export function pantoneToFormData(pantone: Pantone): Record<string, string | number | undefined> {
  const formData: Record<string, string | number | undefined> = {};

  Object.entries(pantone).forEach(([key, value]) => {
    if (key === 'basi' || key === 'dose') return; // Escludi sempre dose
    if (value instanceof Date) formData[key] = value.toISOString();
    else if (typeof value === 'object' && value !== null && '_bsontype' in value) formData[key] = value.toString();
    else if (typeof value === 'string' || typeof value === 'number' || value === undefined) formData[key] = value;
    else formData[key] = String(value);
  });

  // Trova la base con utilizzo Pantone (se esiste)
  const basePantone = pantone.basi?.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'));

  // Mappa solo le basi che NON sono Pantone
  pantone.basi?.forEach((b) => {
    if (Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone')) return;
    formData[`fornitore_${b.nomeMateriale}`] = b.fornitore;
    formData[`valore_${b.nomeMateriale}`] = b.quantita;
    formData[`utilizzo_${b.nomeMateriale}`] = Array.isArray(b.utilizzo) ? b.utilizzo.join(',') : b.utilizzo || '';
  });

  // Se esiste una base Pantone, aggiungi solo il campo pantoneEsternoInput
  if (basePantone) {
    formData.pantoneEsternoInput = basePantone.quantita;
  }

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
