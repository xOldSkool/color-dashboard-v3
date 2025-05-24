import pantoneMerged from '@/constants/pantone-merged.json';

interface PantoneEntry {
  pantone: string;
  hex: string;
}

// Estrae il codice HEX corrispondente a un nome Pantone (es. P186C, P186U).
// Se non trovato, restituisce '#000000'.

export function getHexFromPantone(nomePantone: string): string {
  // Rimuove eventuale 'P' iniziale e separa numero e suffix (C/U)
  const match = nomePantone.match(/^P?(\d+)([CU])$/i);
  if (!match) {
    return '#000000';
  }

  const [, numero, uscita] = match;
  const key = `${numero}-${uscita.toLowerCase()}`;

  // Ricerca nel JSON importato
  const entry = (pantoneMerged as PantoneEntry[]).find((p) => p.pantone.toLowerCase() === key);

  return entry?.hex ?? '#000000';
}
