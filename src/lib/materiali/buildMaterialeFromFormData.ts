import { Materiale } from '@/types/materialeTypes';
import { getEnumValue } from '@/utils/getEnumValues';

/**
 * Costruisce un oggetto Materiale a partire dai dati del form.
 * Conforme a TypeScript strict e best practice Next.js.
 *
 * Perché così? Segue la stessa logica di buildPantoneFromFormData, centralizza la costruzione e normalizzazione,
 * riduce errori e duplicazione, e garantisce coerenza tra form e modello dati.
 */
export function buildMaterialeFromFormData(formData: Record<string, string | number | string[] | undefined>): Materiale {
  // Type guard per valid enum
  const isValidUtilizzo = (u: string): u is 'Base' | 'Materiale' | 'Pantone' => ['Base', 'Materiale', 'Pantone'].includes(u);
  let utilizzo: Array<'Base' | 'Materiale' | 'Pantone'> = [];
  if (Array.isArray(formData.utilizzo)) {
    utilizzo = (formData.utilizzo as string[]).filter(isValidUtilizzo);
  } else if (typeof formData.utilizzo === 'string' && formData.utilizzo) {
    utilizzo = formData.utilizzo
      .split(',')
      .map((u) => u.trim())
      .filter(isValidUtilizzo);
  }
  return {
    nomeMateriale: String(formData.nomeMateriale || ''),
    label: String(formData.label || ''),
    codiceColore: String(formData.codiceColore || ''),
    codiceFornitore: String(formData.codiceFornitore || ''),
    quantita: Number(formData.quantita) || 0,
    fornitore: String(formData.fornitore || ''),
    tipo: getEnumValue(formData.tipo, ['EB', 'UV'] as const, 'EB'),
    stato: getEnumValue(formData.stato, ['In uso', 'Obsoleto', 'Da verificare'] as const, 'In uso'),
    utilizzo,
    noteMateriale: formData.noteMateriale ? String(formData.noteMateriale) : undefined,
    dataCreazione: formData.dataCreazione ? String(formData.dataCreazione) : new Date().toISOString(),
    movimenti:
      Array.isArray(formData.movimenti) && formData.movimenti.length > 0 && typeof formData.movimenti[0] === 'object'
        ? (formData.movimenti as unknown as Materiale['movimenti'])
        : [],
  };
}
