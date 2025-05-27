import { ObjectId } from 'mongodb';

export interface Pantone {
  _id: ObjectId | string;
  nomePantone: string;
  variante: string;
  dataCreazione: Date | string;
  articolo: string;
  is: string;
  cliente: string;
  noteArticolo?: string;
  urgente: boolean;
  tipoCarta: string;
  fornitoreCarta: string;
  passoCarta: number;
  hCarta: number;
  hex: string;
  stato: string;
  tipo: string;
  descrizione: string;
  noteColore?: string;
  consumo: number;
  dose: number;
  daProdurre?: boolean;
  qtDaProdurre?: number;
  battuteDaProdurre?: number;
  consegnatoProduzione?: boolean;
  qtConsegnataProduzione?: number;
  pantoneGroupId: string;
  basi?: BasiPantone[]; // Basi opzionali (può non esserci o essere array vuoto)
  basiNormalizzate?: string;
}

export interface BasiPantone {
  name: string;
  label: string;
  codiceFornitore: string;
  codiceColore: string;
  tipo: string;
  quantita: number;
  fornitore: string;
}
