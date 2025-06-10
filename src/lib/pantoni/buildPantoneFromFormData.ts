import { Pantone, BasiPantone } from '@/types/pantoneTypes';
import { BaseMateriale } from '@/types/materialeTypes';
import { getEnumValue } from '@/utils/getEnumValues';

/**
 * Costruisce un oggetto Pantone a partire dai dati del form e dai dati di base/materiali.
 * Estrae la logica comune a tutti i form Pantone (New, Edit, Duplicate).
 * Conforme a TypeScript strict e best practice Next.js.
 */
export function buildPantoneFromFormData({
  formData,
  basiRaggruppatePerName,
  pantoneEsternoSelezionato,
  pantoneMateriali,
}: {
  formData: Record<string, string | number | undefined>;
  basiRaggruppatePerName: Record<string, BaseMateriale[]>;
  pantoneEsternoSelezionato: string | null;
  pantoneMateriali: BaseMateriale[];
}): Pantone {
  const basiFinali: BasiPantone[] = Object.entries(basiRaggruppatePerName)
    .map(([nomeBase, basiArr]) => {
      const fornitoreSelezionato = formData[`fornitore_${nomeBase}`];
      const valoreInserito = formData[`valore_${nomeBase}`];
      const baseSelezionata = basiArr.find((b: BaseMateriale) => b.fornitore === fornitoreSelezionato) || basiArr[0];
      return {
        nomeMateriale: baseSelezionata.nomeMateriale,
        label: baseSelezionata.label,
        quantita: Number(valoreInserito) || 0,
        codiceFornitore: String(baseSelezionata.codiceFornitore || ''),
        fornitore: String(baseSelezionata.fornitore || ''),
        tipo: String(baseSelezionata.tipo || ''),
        codiceColore: String(baseSelezionata.codiceColore || ''),
        utilizzo: ['Base'],
      };
    })
    .filter((b) => b.quantita > 0);
  // Pantone esterno
  if (pantoneEsternoSelezionato && formData.pantoneEsternoInput) {
    const pantoneEsterno = pantoneMateriali.find((m: BaseMateriale) => m._id?.toString() === pantoneEsternoSelezionato);
    if (pantoneEsterno) {
      basiFinali.push({
        nomeMateriale: pantoneEsterno.nomeMateriale,
        label: pantoneEsterno.label,
        quantita: Number(formData.pantoneEsternoInput) || 0,
        codiceFornitore: String(pantoneEsterno.codiceFornitore || ''),
        fornitore: String(pantoneEsterno.fornitore || ''),
        tipo: String(pantoneEsterno.tipo || ''),
        codiceColore: String(pantoneEsterno.codiceColore || ''),
        utilizzo: ['Pantone'],
      });
    }
  }
  return {
    nomePantone: String(formData.nomePantone || ''),
    variante: String(formData.variante || ''),
    dataCreazione: new Date().toISOString(),
    ultimoUso: '',
    articolo: String(formData.articolo || ''),
    is: String(formData.is || ''),
    cliente: String(formData.cliente || ''),
    noteArticolo: String(formData.noteArticolo || ''),
    urgente: Boolean(formData.urgente) && formData.urgente !== 'false',
    tipoCarta: String(formData.tipoCarta || ''),
    fornitoreCarta: String(formData.fornitoreCarta || ''),
    passoCarta: Number(formData.passoCarta) || 0,
    hCarta: Number(formData.hCarta) || 0,
    stato: getEnumValue(formData.stato, ['In uso', 'Obsoleto', 'Da verificare'] as const, 'In uso'),
    tipo: getEnumValue(formData.tipo, ['EB', 'UV'] as const, 'EB'),
    descrizione: String(formData.descrizione || ''),
    noteColore: String(formData.noteColore || ''),
    consumo: Number(formData.consumo) || 0,
    dose: Number(formData.dose) || 0,
    daProdurre: Boolean(formData.daProdurre) && formData.daProdurre !== 'false',
    qtDaProdurre: Number(formData.qtDaProdurre) || 0,
    battuteDaProdurre: Number(formData.battuteDaProdurre) || 0,
    consegnatoProduzione: Boolean(formData.consegnatoProduzione) && formData.consegnatoProduzione !== 'false',
    qtConsegnataProduzione: Number(formData.qtConsegnataProduzione) || 0,
    pantoneGroupId: String(formData.pantoneGroupId || ''),
    basi: basiFinali,
    basiNormalizzate: '',
  };
}
