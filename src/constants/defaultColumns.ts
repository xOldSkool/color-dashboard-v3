import { TableColumn } from '@/types/constantsTypes';

export const PANTONE_COLUMNS: TableColumn[] = [
  {
    key: '_id',
    label: '_id',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'nomePantone',
    label: 'Nome Pantone',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'variante',
    label: 'Variante',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'dataCreazione',
    label: 'Data Creazione',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'ultimoUso',
    label: 'Ultimo uso',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'articolo',
    label: 'Articolo',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'is',
    label: 'IS',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'cliente',
    label: 'Cliente',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'noteArticolo',
    label: 'Note Articolo',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'tipoCarta',
    label: 'Tipo Carta',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'fornitoreCarta',
    label: 'Fornitore Carta',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'passoCarta',
    label: 'Passo',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'hCarta',
    label: 'Altezza Carta',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'hex',
    label: '#',
    sortable: false,
    visibleByDefault_COLS: true,
    hideable: false,
  },
  {
    key: 'stato',
    label: 'Stato',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'tipo',
    label: 'Tipo',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'descrizione',
    label: 'Descrizione',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'noteColore',
    label: 'Note Colore',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'consumo',
    label: 'Consumo',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'dose',
    label: 'Dose',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'daProdurre',
    label: 'Da produrre',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'qtDaProdurre',
    label: 'Quantità da produrre',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'battuteDaProdurre',
    label: 'Battute da produrre',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'consegnatoProduzione',
    label: 'Consegnato Produzione',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'qtConsegnataProduzione',
    label: 'Quantità Consegnata Produzione',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'urgente',
    label: 'Urgente',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'pantoneGroupId',
    label: 'Pantone Group ID',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'codiceFornitore',
    label: 'Codice Fornitore',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'basi',
    label: 'Composizione',
    sortable: false,
    visibleByDefault_COLS: false,
    hideable: true,
    type: 'array',
  },
  {
    key: 'basiNormalizzate',
    label: 'Basi Normalizzate',
    sortable: false,
    visibleByDefault_COLS: false,
    hideable: true,
  },
];
export const MAGAZZINO_PANTONI_COLUMNS: TableColumn[] = [
  {
    key: '_id',
    label: '_id',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'pantoneGroupId',
    label: 'Pantone Group ID',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: false,
  },
  {
    key: 'nomePantone',
    label: 'Nome Pantone',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: false,
  },
  {
    key: 'dispMagazzino',
    label: 'Disponibilità Magazzino',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: false,
  },
  {
    key: 'tipo',
    label: 'Tipo',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'ultimoUso',
    label: 'Ultimo Uso',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'noteMagazzino',
    label: 'Note Magazzino',
    sortable: true,
    visibleByDefault_COLS: false,
    hideable: true,
  },
  {
    key: 'count',
    label: 'N° Pantoni',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'movimenti',
    label: 'Movimenti',
    sortable: false,
    visibleByDefault_COLS: false,
    hideable: true,
    type: 'array',
  },
];
export const MOVIMENTI_MAGAZZINO_COLUMNS: TableColumn[] = [
  {
    key: 'tipo',
    label: 'Tipo',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'quantita',
    label: 'Quantità',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'data',
    label: 'Data',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'causale',
    label: 'Causale',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
];
export const MATERIALI_COLUMNS: TableColumn[] = [
  {
    key: 'nomeMateriale',
    label: 'Materiale',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'label',
    label: 'Materiale',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'stato',
    label: 'Stato',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'codiceColore',
    label: 'Codice colore',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'codiceFornitore',
    label: 'Codice fornitore',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'quantita',
    label: 'Quantità',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'fornitore',
    label: 'Fornitore',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'tipo',
    label: 'Tipo',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'utilizzo',
    label: 'Utilizzo',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'noteMateriale',
    label: 'Note materiale',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'dataCreazione',
    label: 'Data creazione',
    sortable: true,
    visibleByDefault_COLS: true,
    hideable: true,
  },
  {
    key: 'movimenti',
    label: 'Movimenti Materiali',
    sortable: false,
    visibleByDefault_COLS: false,
    hideable: true,
    type: 'array',
  },
];
export const MOVIMENTI_MATERIALE_COLUMNS: TableColumn[] = [
  { key: 'quantita', label: 'Quantità', sortable: true, visibleByDefault_COLS: true, hideable: true },
  { key: 'DDT', label: 'DDT', sortable: true, visibleByDefault_COLS: true, hideable: true },
  { key: 'dataDDT', label: 'Data DDT', sortable: true, visibleByDefault_COLS: true, hideable: true },
  { key: 'data', label: 'Data Movimento', sortable: true, visibleByDefault_COLS: true, hideable: true },
  { key: 'tipo', label: 'Tipo', sortable: true, visibleByDefault_COLS: true, hideable: true },
  { key: 'causale', label: 'Causale', sortable: true, visibleByDefault_COLS: true, hideable: true },
  { key: 'noteOperatore', label: 'Note Operatore', sortable: true, visibleByDefault_COLS: true, hideable: true },
];

export const SHOWABLE_MOVIMENTI_MAGAZZINO_COLS: string[] = ['tipo', 'quantita', 'data', 'causale'];
export const SHOWABLE_MOVIMENTI_MATERIALE_COLS: string[] = ['quantita', 'DDT', 'dataDDT', 'data', 'tipo', 'causale', 'noteOperatore'];

export const DEFAULT_COLS: string[] = [
  'hex',
  'nomePantone',
  'variante',
  'articolo',
  'cliente',
  'tipo',
  'consumo',
  'dose',
  'dispMagazzino',
  'passoCarta',
  'hCarta',
  'descrizione',
];

export const CONFIG_DA_PRODURRE: string[] = ['hex', 'nomePantone', 'variante', 'cliente', 'articolo', 'qtDaProdurre', 'basi', 'noteArticolo'];
export const CONFIG_MAGAZZINO_PANTONI: string[] = [
  'hex',
  'nomePantone',
  'variante',
  'cliente',
  'fornitore',
  'tipo',
  'dispMagazzino',
  'noteMagazzino',
  'count',
];
export const CONFIG_MOVIMENTI_MAGAZZINO_PANTONE: string[] = ['quantita', 'tipo', 'data', 'causale'];
export const CONFIG_CONSEGNATI_PRODUZIONE: string[] = ['hex', 'nomePantone', 'variante', 'consumo', 'dose', 'cliente', 'qtConsegnataProduzione'];
export const CONFIG_SCHEDA_PANTONE: string[] = [
  'variante',
  'articolo',
  'passoCarta',
  'hCarta',
  'consumo',
  'descrizione',
  'noteArticolo',
  'noteColore',
];
export const CONFIG_MATERIALI: string[] = ['label', 'codiceColore', 'fornitore', 'tipo', 'quantita', 'utilizzo', 'stato'];
export const CONFIG_MOVIMENTI_MATERIALE: string[] = ['tipo', 'quantita', 'causale', 'data', 'noteOperatore', 'DDT', 'dataDDT'];
// export const CONFIG_MAGAZZINO_PANTONI: string[] = ['nomePantone', 'tipo', 'cliente', 'variante', 'ultimoUso'];

export const visibleColumns = DEFAULT_COLS.map((key) => PANTONE_COLUMNS.find((col) => col.key === key)); //scorre ogni chiave in DEFAULT_COLS e per ogni chiave (key) cerca nell'array PANTONE_COLUMNS l'oggetto con quella chiave (key). "!" serve a dire che si trova sempre un valore diverso da undefined

// Unione di tutte le colonne definite nei vari moduli, senza duplicati (per key)
export const ALL_DB_COLUMNS: TableColumn[] = Array.from(
  [...PANTONE_COLUMNS, ...MAGAZZINO_PANTONI_COLUMNS, ...MATERIALI_COLUMNS]
    .reduce((acc, col) => {
      if (!acc.has(col.key)) acc.set(col.key, col);
      return acc;
    }, new Map<string, TableColumn>())
    .values()
);

export const SHOWABLE_ALL_DB_COLS: string[] = ALL_DB_COLUMNS.map((col) => col.key).filter(
  (key) => key !== '_id' && key !== 'daProdurre' && key !== 'consegnatoProduzione' && key !== 'urgente' && key !== 'basiNormalizzate'
);
