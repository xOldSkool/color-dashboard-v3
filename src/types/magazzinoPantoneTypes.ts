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
  tipo: string;
  ultimoUso: Date | string;
  movimenti?: MovimentoMagazzino[];
}
