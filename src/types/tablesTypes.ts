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
