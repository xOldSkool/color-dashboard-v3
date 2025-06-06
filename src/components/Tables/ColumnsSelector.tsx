'use client';

import {
  MOVIMENTI_MAGAZZINO_COLUMNS,
  MOVIMENTI_MATERIALE_COLUMNS,
  ALL_DB_COLUMNS,
  SHOWABLE_ALL_DB_COLS,
  SHOWABLE_MOVIMENTI_MAGAZZINO_COLS,
  SHOWABLE_MOVIMENTI_MATERIALE_COLS,
} from '@/constants/defaultColumns';
import { useTableStore } from '@/store/useTableStore';
import { TableColumn } from '@/types/constantsTypes';
import { JSX } from 'react';

export type TableKey =
  | 'ricettario'
  | 'materiali' //
  | 'movimenti-materiale'
  | 'magazzino-pantoni' //
  | 'da-produrre'
  | 'consegnati-produzione'
  | 'movimenti-magazzino'
  | 'scheda-pantone';
export interface ColumnSelectorProps {
  tableKey: TableKey;
}

export default function ColumnSelector({ tableKey }: ColumnSelectorProps): JSX.Element {
  const { getVisibleUserCols, setVisibleUserCols } = useTableStore();
  const visibleUserCols = getVisibleUserCols(tableKey);

  const toggleColumn = (key: string) => {
    if (visibleUserCols.includes(key)) {
      setVisibleUserCols(
        tableKey,
        visibleUserCols.filter((k) => k !== key)
      );
    } else {
      setVisibleUserCols(tableKey, [...visibleUserCols, key]);
    }
  };

  let columns: TableColumn[] = [];
  if (
    tableKey === 'materiali' ||
    tableKey === 'magazzino-pantoni' ||
    tableKey === 'ricettario' ||
    tableKey === 'da-produrre' ||
    tableKey === 'consegnati-produzione' ||
    tableKey === 'scheda-pantone'
  ) {
    columns = SHOWABLE_ALL_DB_COLS.map((key) => ALL_DB_COLUMNS.find((c) => c.key === key)).filter((c): c is TableColumn => Boolean(c));
  } else if (tableKey === 'movimenti-materiale') {
    columns = SHOWABLE_MOVIMENTI_MATERIALE_COLS.map((key) => MOVIMENTI_MATERIALE_COLUMNS.find((c) => c.key === key)).filter((c): c is TableColumn =>
      Boolean(c)
    );
  } else if (tableKey === 'movimenti-magazzino') {
    columns = SHOWABLE_MOVIMENTI_MAGAZZINO_COLS.map((key) => MOVIMENTI_MAGAZZINO_COLUMNS.find((c) => c.key === key)).filter((c): c is TableColumn =>
      Boolean(c)
    );
  }

  return (
    <div className="p-4 w-full">
      <p className="font-semibold mb-2 text-lg">Seleziona le colonne da visualizzare nella tabella:</p>
      <ul className="grid grid-cols-3 gap-2">
        {columns.map((col) =>
          col ? (
            <li key={col.key}>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={visibleUserCols.includes(col.key)} onChange={() => toggleColumn(col.key)} />
                {col.label}
              </label>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}
