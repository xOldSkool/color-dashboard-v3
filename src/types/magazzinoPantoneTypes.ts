import { ObjectId } from 'mongodb';

export interface MovimentoMagazzino {
  tipo: 'carico' | 'scarico';
  quantita: number;
  data: Date | string;
  causale: string;
}

export interface MagazzinoPantoni {
  _id: ObjectId | string;
  pantoneGroupId: string;
  dispMagazzino: number;
  tipo: 'EB' | 'UV';
  ultimoUso: Date | string;
  noteColore?: string;
  noteMagazzino?: string;
  count?: number;
  movimenti?: MovimentoMagazzino[];
}
