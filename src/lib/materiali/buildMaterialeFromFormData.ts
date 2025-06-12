import { Materiale } from '@/types/materialeTypes';
import { getEnumValue } from '@/utils/getEnumValues';
import { normalizzaMovimenti } from './normalizzaMovimenti';

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

  // Normalizzazione campi numerici e date
  const parseNumber = (val: unknown): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim() !== '') return Number(val);
    return 0;
  };
  const parseString = (val: unknown): string => (val !== undefined && val !== null ? String(val) : '');
  const parseDateString = (val: unknown): string => {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') {
      // Normalizza formato yyyy-mm-dd (date picker HTML) in ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(val + 'T00:00:00.000Z').toISOString();
      }
      return val;
    }
    return '';
  };

  // Normalizza eventuali movimenti
  let movimenti: Materiale['movimenti'] = [];
  if (Array.isArray(formData.movimenti) && formData.movimenti.length > 0 && typeof formData.movimenti[0] === 'object') {
    // Filtra solo oggetti validi (esclude stringhe o altri tipi)
    const movimentiObj = (formData.movimenti as unknown[]).filter(
      (m): m is Record<string, unknown> => typeof m === 'object' && m !== null && !Array.isArray(m)
    );
    // Conversione esplicita: normalizza ogni oggetto in un MovimentoMateriale minimale
    const movimentiMateriale = movimentiObj.map((mov) => ({
      tipo: mov.tipo === 'carico' ? 'carico' : 'scarico',
      quantita: parseNumber(mov.quantita),
      data: parseDateString(mov.data),
      causale: mov.causale !== undefined ? parseString(mov.causale) : '',
      noteOperatore: mov.noteOperatore !== undefined ? parseString(mov.noteOperatore) : undefined,
      DDT: mov.DDT !== undefined ? parseString(mov.DDT).trim() : '',
      dataDDT: mov.dataDDT !== undefined ? parseDateString(mov.dataDDT) : '',
      riferimentoPantone: mov.riferimentoPantone !== undefined ? parseString(mov.riferimentoPantone) : undefined,
      _id: mov._id !== undefined ? parseString(mov._id) : undefined,
    })) as import('@/types/materialeTypes').MovimentoMateriale[];
    movimenti = normalizzaMovimenti(movimentiMateriale) as Materiale['movimenti'];
  }

  return {
    nomeMateriale: parseString(formData.nomeMateriale),
    label: parseString(formData.label),
    codiceColore: parseString(formData.codiceColore),
    codiceFornitore: parseString(formData.codiceFornitore),
    quantita: parseNumber(formData.quantita),
    fornitore: parseString(formData.fornitore),
    tipo: getEnumValue(formData.tipo, ['EB', 'UV'] as const, 'EB'),
    stato: getEnumValue(formData.stato, ['In uso', 'Obsoleto', 'Da verificare'] as const, 'In uso'),
    utilizzo,
    noteMateriale: formData.noteMateriale ? parseString(formData.noteMateriale) : undefined,
    dataCreazione: formData.dataCreazione ? parseDateString(formData.dataCreazione) : new Date().toISOString(),
    movimenti,
  };
}
