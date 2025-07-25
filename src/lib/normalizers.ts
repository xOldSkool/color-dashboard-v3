import { Materiale, RawMateriale } from '@/types/materialeTypes';
import { Pantone, RawPantone } from '@/types/pantoneTypes';

export function normalizePantone(raw: RawPantone): Pantone {
  return {
    // _id da ObjectId a string
    _id: raw._id!.toString(),

    // stringhe o numeri semplici
    nomePantone: String(raw.nomePantone),
    passoCarta: Number(raw.passoCarta ?? 0),
    hCarta: Number(raw.hCarta ?? 0),
    consumo: Number(raw.consumo ?? 0),
    dose: parseFloat(Number(raw.dose ?? 0).toFixed(3)),
    variante: String(raw.variante ?? ''),
    articolo: String(raw.articolo ?? ''),
    is: String(raw.is ?? ''),
    cliente: String(raw.cliente ?? ''),
    stato: raw.stato === 'In uso' || raw.stato === 'Obsoleto' || raw.stato === 'Da verificare' ? raw.stato : 'Da verificare',
    tipoCarta: String(raw.tipoCarta ?? ''),
    fornitoreCarta: String(raw.fornitoreCarta ?? ''),
    tipo: raw.tipo === 'EB' || raw.tipo === 'UV' ? raw.tipo : 'EB',
    descrizione: String(raw.descrizione ?? ''),
    noteArticolo: String(raw.noteArticolo ?? ''),
    consegnatoProduzione: Boolean(raw.consegnatoProduzione),
    qtConsegnataProduzione: Number(raw.qtConsegnataProduzione ?? 0),
    pantoneGroupId: String(raw.pantoneGroupId ?? ''),
    daProdurre: Boolean(raw.daProdurre),
    qtDaProdurre: Number(raw.qtDaProdurre ?? 0),
    battuteDaProdurre: Number(raw.battuteDaProdurre ?? 0),
    urgente: Boolean(raw.urgente ?? false),
    basi: Array.isArray(raw.basi)
      ? raw.basi.map((b) => {
          let utilizzoArr: string[] = [];
          const rawUtilizzo = (b as { utilizzo?: unknown }).utilizzo;
          if (Array.isArray(rawUtilizzo)) {
            utilizzoArr = rawUtilizzo.map((v: unknown) => String(v));
          } else if (typeof rawUtilizzo === 'string' && rawUtilizzo.length > 0) {
            utilizzoArr = (rawUtilizzo as string)
              .split(',')
              .map((v: string) => v.trim())
              .filter(Boolean);
          }
          return {
            nomeMateriale: String(b.nomeMateriale),
            label: String(b.label),
            codiceFornitore: String(b.codiceFornitore),
            codiceColore: String(b.codiceColore),
            tipo: String(b.tipo),
            quantita: Number(b.quantita),
            fornitore: String(b.fornitore),
            utilizzo: utilizzoArr,
          };
        })
      : [],
    hex: String(raw.hex ?? ''),

    dataCreazione: raw.dataCreazione ? new Date(raw.dataCreazione).toISOString() : '',
    ultimoUso: raw.ultimoUso ? new Date(raw.ultimoUso).toISOString() : '',
  };
}

export function normalizePantoni(rawList: RawPantone[]): Pantone[] {
  return rawList.map(normalizePantone);
}

export function normalizeMateriali(raws: RawMateriale[]): Materiale[] {
  return raws.map((raw) => {
    const {
      _id,
      nomeMateriale,
      stato,
      label,
      codiceColore,
      codiceFornitore,
      quantita,
      fornitore,
      tipo,
      utilizzo,
      noteMateriale,
      dataCreazione,
      movimenti,
    } = raw;

    return {
      _id: _id!.toString(),
      nomeMateriale,
      stato,
      label,
      codiceColore,
      codiceFornitore,
      quantita,
      fornitore,
      tipo,
      utilizzo,
      noteMateriale,
      dataCreazione,
      movimenti,
    };
  });
}

export function normalizeMovimenti(materiale: Materiale) {
  return (materiale.movimenti ?? []).map((mov, idx) => ({
    ...mov,
    _id: `${materiale._id}_mov_${idx}`,
    materialeId: materiale._id,
  }));
}
