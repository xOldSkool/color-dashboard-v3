import { ObjectId } from 'mongodb';

export interface Pantone {
  _id?: ObjectId | string;
  nomePantone: string;
  variante: string;
  dataCreazione: Date | string;
  ultimoUso: Date | string;
  articolo: string;
  is?: string;
  cliente: string;
  noteArticolo?: string;
  urgente: boolean;
  tipoCarta: string;
  fornitoreCarta: string;
  passoCarta: number;
  hCarta: number;
  hex?: string;
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  tipo: 'EB' | 'UV';
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
  basi?: BasiPantone[];
  basiNormalizzate?: string;
}

export interface BasiPantone {
  nomeMateriale: string;
  label: string;
  codiceFornitore: string;
  codiceColore: string;
  tipo: string;
  quantita: number;
  fornitore: string;
  utilizzo: string[]; // ora sempre array
}

export interface RawPantone {
  _id?: string | ObjectId;
  nomePantone?: string;
  passoCarta?: number;
  hCarta?: number;
  consumo?: number;
  dose?: number;
  variante?: string;
  articolo?: string;
  is?: string;
  cliente?: string;
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  tipoCarta?: string;
  fornitoreCarta?: string;
  tipo?: 'EB' | 'UV';
  descrizione?: string;
  noteColore?: string;
  noteArticolo?: string;
  consegnatoProduzione?: boolean;
  qtConsegnataProduzione?: number;
  pantoneGroupId?: string;
  daProdurre?: boolean;
  qtDaProdurre?: number;
  battuteDaProdurre?: number;
  urgente?: boolean;
  basi?: BasiPantone[];
  hex?: string;
  dataCreazione?: string | Date;
  ultimoUso: Date | string;
}

export interface DeliverPantoneParams {
  pantoneId: string;
  pantoneGroupId: string;
  tipo: string;
  quantita: number;
  causale?: string;
}
