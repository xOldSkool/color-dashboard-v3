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
  name: string;
  label: string;
  codiceColore?: string;
  codiceFornitore?: string;
  quantita: number;
  fornitore: string;
  tipo: 'carico' | 'scarico';
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  utilizzo: 'Base' | 'Materiale';
  noteMateriale?: string;
  dataCreazione: Date | string;
  movimenti?: MovimentoMateriale[];
}

export type BaseMateriale = Pick<
  Materiale,
  'name' | 'label' | 'quantita' | 'codiceColore' | 'codiceFornitore' | 'fornitore' | 'tipo' | 'stato' | 'utilizzo' | '_id'
>;

export interface RawMateriale {
  _id: string | ObjectId;
  name: string;
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  label: string;
  codiceColore: string;
  codiceFornitore: string;
  quantita: number;
  fornitore: string;
  tipo: 'carico' | 'scarico';
  utilizzo: 'Base' | 'Materiale';
  noteMateriale: string;
  dataCreazione: string | Date;
  movimenti: MovimentoMateriale[];
}
