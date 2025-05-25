import { ObjectId } from 'mongodb';

export interface MovimentoMateriale {
  tipo: 'carico' | 'scarico';
  quantita: number;
  data: Date | string;
  noteOperatore?: string;
  causale: string;
  riferimentoPantone?: string;
}

export interface Materiale {
  _id: ObjectId | string;
  nome: string;
  label: string;
  codiceColore?: string;
  codiceFornitore?: string;
  quantita: number;
  fornitore: string;
  tipo: string;
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  utilizzo: 'base' | 'materiale';
  noteMateriale?: string;
  dataCreazione: Date | string;
  movimenti?: MovimentoMateriale[];
}
