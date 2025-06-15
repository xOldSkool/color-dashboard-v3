import { TableColumn } from './constantsTypes';
import { MagazzinoPantoni } from './magazzinoPantoneTypes';
import { Materiale, MovimentoMateriale } from './materialeTypes';
import { Pantone } from './pantoneTypes';

export type BaseItem = Pantone | MagazzinoPantoni | Materiale | MovimentoMateriale;

export interface TableBodyProps<T extends BaseItem> {
  data: T[];
  visibleColumns: TableColumn[];
  sortKey: string | number;
  sortOrder: 'asc' | 'desc';
  handleSort: (key: string | number) => void;
  toggleSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
  allSelected: boolean;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
  allIds: string[];
  tableKey: string;
  currentPage: number;
  rowsPerPage: number;
}

export interface TableProps<T extends BaseItem> {
  items: T[];
  config: string[];
  tableKey: string;
  rows?: number;
  filterFn?: (item: T) => boolean;
  // Props opzionali per inventario
  quantitaReale?: Record<string, number>;
  setQuantitaReale?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  quantitaDaOrdinare?: Record<string, number>;
  setQuantitaDaOrdinare?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  // Funzioni wrapper per input custom inventario
  onChangeQuantitaReale?: (id: string, value: number) => void;
  onChangeQuantitaDaOrdinare?: (id: string, value: number) => void;
}

export interface TablePaginationProps {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalItems: number;
  rowsPerPage: number;
}

export interface TableToolbarProps<T extends BaseItem> {
  data: T[];
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  tableKey: string;
}

export type TableKey =
  | 'ricettario'
  | 'materiali'
  | 'movimenti-materiale'
  | 'magazzino-pantoni'
  | 'da-produrre'
  | 'consegnati-produzione'
  | 'movimenti-magazzino'
  | 'scheda-pantone'
  | 'inventario';
