import { ObjectId } from 'mongodb';

export interface MovimentoMateriale {
  _id?: string;
  tipo: 'carico' | 'scarico';
  quantita: number;
  data: Date | string;
  noteOperatore?: string;
  DDT?: string;
  dataDDT?: Date | string;
  causale: string;
  riferimentoPantone?: string;
}

export interface Materiale {
  _id?: ObjectId | string;
  nomeMateriale: string;
  label: string;
  codiceColore?: string;
  codiceFornitore?: string;
  quantita: number;
  fornitore: string;
  tipo: 'EB' | 'UV';
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  utilizzo: 'Base' | 'Materiale' | 'Pantone';
  noteMateriale?: string;
  dataCreazione: Date | string;
  movimenti?: MovimentoMateriale[];
}

export type BaseMateriale = Pick<
  Materiale,
  'nomeMateriale' | 'label' | 'quantita' | 'codiceColore' | 'codiceFornitore' | 'fornitore' | 'tipo' | 'stato' | 'utilizzo' | '_id'
>;

export interface RawMateriale {
  _id?: string | ObjectId;
  nomeMateriale: string;
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  label: string;
  codiceColore?: string;
  codiceFornitore?: string;
  quantita: number;
  fornitore: string;
  tipo: 'EB' | 'UV';
  utilizzo: 'Base' | 'Materiale' | 'Pantone';
  noteMateriale?: string;
  dataCreazione: string | Date;
  movimenti?: MovimentoMateriale[];
}
