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

export interface MovimentoCaricoInput {
  quantita: number;
  causale: string;
  DDT: string;
  dataDDT: string | Date;
  riferimentoPantone?: string;
  noteOperatore?: string;
}

export interface MovimentoScaricoInput {
  quantita: number;
  noteOperatore: string;
}

export interface Materiale {
  _id?: ObjectId | string;
  nomeMateriale: string;
  label: string;
  codiceColore?: string | null;
  codiceFornitore?: string | null;
  quantita: number;
  fornitore: string;
  tipo: 'EB' | 'UV';
  stato: 'In uso' | 'Obsoleto' | 'Da verificare';
  utilizzo: Array<'Base' | 'Materiale' | 'Pantone'>;
  noteMateriale?: string | null;
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
  codiceColore?: string | null;
  codiceFornitore?: string | null;
  quantita: number;
  fornitore: string;
  tipo: 'EB' | 'UV';
  utilizzo: Array<'Base' | 'Materiale' | 'Pantone'>;
  noteMateriale?: string | null;
  dataCreazione: string | Date;
  movimenti?: MovimentoMateriale[];
}
