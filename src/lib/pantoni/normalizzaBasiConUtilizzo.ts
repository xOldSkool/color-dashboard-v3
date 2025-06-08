import { BasiPantone } from '@/types/pantoneTypes';

/**
 * Normalizza le basi assicurando che ogni oggetto abbia la proprietà `utilizzo` come array di stringhe.
 * Se una base non ha tutte le proprietà richieste da BasiPantone, lancia un errore (strict mode).
 * Sicura da usare sia client che server.
 */
export function normalizzaBasiConUtilizzo(basi: BasiPantone[] = []): BasiPantone[] {
  return basi.map((b) => {
    if (
      typeof b.nomeMateriale !== 'string' ||
      typeof b.label !== 'string' ||
      typeof b.codiceFornitore !== 'string' ||
      typeof b.codiceColore !== 'string' ||
      typeof b.tipo !== 'string' ||
      typeof b.quantita !== 'number' ||
      typeof b.fornitore !== 'string'
    ) {
      throw new Error('Oggetto base non conforme a BasiPantone');
    }
    let utilizzoArr: string[] = [];
    if (Array.isArray(b.utilizzo)) {
      utilizzoArr = b.utilizzo.map((v: unknown) => String(v));
    } else if (typeof b.utilizzo === 'string' && (b.utilizzo as string).length > 0) {
      utilizzoArr = (b.utilizzo as string)
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean);
    }
    return {
      ...b,
      utilizzo: utilizzoArr,
    };
  });
}
