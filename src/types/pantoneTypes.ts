import { ObjectId } from 'mongodb';

export interface BasiPantone {
  nome: string;
  label: string;
  valore: number;
  codiceFornitore: string;
  codiceColore: string;
  tipo: string;
  quantita: number;
  fornitore: string;
}

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
  noteMagazzino?: string;
  daProdurre?: boolean;
  qtDaProdurre?: number;
  battuteDaProdurre?: number;
  consegnatoProduzione?: boolean;
  qtConsegnataProduzione?: number;
  pantoneGroupId: string;
  basi?: BasiPantone[]; // Basi opzionali (può non esserci o essere array vuoto)
}
