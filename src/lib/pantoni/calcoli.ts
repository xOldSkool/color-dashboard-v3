// Centralized calculation logic for Pantone production
// This function can be imported by both backend and frontend for consistent business logic
import { BasiPantone } from '@/types/pantoneTypes';

export interface CalcolaProduzionePantoneInput {
  consumo: number; // consumo per 1000 battute
  dose: number; // dose totale (somma basi)
  battute: number; // numero battute richieste
  dispMagazzino?: number; // disponibilità magazzino (kg)
  basi: BasiPantone[];
}

export interface CalcolaProduzionePantoneOutput {
  kgTotali: number;
  nDosi: number;
  basiRisultato: Array<BasiPantone & { kgRichiesti: number }>;
}

export function calcolaProduzionePantone({
  consumo,
  dose,
  battute,
  dispMagazzino = 0,
  basi,
}: CalcolaProduzionePantoneInput): CalcolaProduzionePantoneOutput {
  let kgTotali = (consumo * battute) / 1000;
  if (dispMagazzino > 0) {
    kgTotali = kgTotali - dispMagazzino;
    if (kgTotali < 0) kgTotali = 0;
  }
  const nDosi = dose > 0 ? kgTotali / dose : 0;
  const basiRisultato = basi.map((b) => ({
    ...b,
    kgRichiesti: dose > 0 ? +((b.quantita / dose) * kgTotali).toFixed(3) : 0,
  }));
  return { kgTotali, nDosi, basiRisultato };
}
