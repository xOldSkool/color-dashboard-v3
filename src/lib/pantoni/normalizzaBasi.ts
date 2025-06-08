import { BasiPantone } from '@/types/pantoneTypes';

// Funzione pura, sicura da usare sia client che server
export function normalizzaBasi(basi: BasiPantone[] = []): string {
  return basi
    .filter((b) => b.quantita > 0)
    .sort((a, b) => a.nomeMateriale.localeCompare(b.nomeMateriale))
    .map((b) => `${b.nomeMateriale}:${b.label}:${b.quantita}:${b.fornitore}:${b.tipo}:${b.codiceColore}:${(b.utilizzo || []).join(',')}`)
    .join('|');
}
