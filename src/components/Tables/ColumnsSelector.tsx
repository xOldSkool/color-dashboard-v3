'use client';

import { MATERIALI_COLUMNS, PANTONE_COLUMNS, SHOWABLE_MATERIALI_COLS, SHOWABLE_PANTONE_COLS } from '@/constants/defaultColumns';
import { useTableStore } from '@/store/useTableStore';
import { JSX } from 'react';

export type TableKey = 'materiali' | 'pantoni';
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

  return (
    <div className="p-4 w-full">
      <p className="font-semibold mb-2 text-lg">Seleziona le colonne da visualizzare nella tabella:</p>
      <ul className="grid grid-cols-3 gap-2">
        {tableKey === 'materiali'
          ? SHOWABLE_MATERIALI_COLS.map((key) => {
              const col = MATERIALI_COLUMNS.find((c) => c.key === key);
              if (!col) return null;

              return (
                <li key={key}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={visibleUserCols.includes(key)} onChange={() => toggleColumn(key)} />
                    {col.label}
                  </label>
                </li>
              );
            })
          : SHOWABLE_PANTONE_COLS.map((key) => {
              const col = PANTONE_COLUMNS.find((c) => c.key === key);
              if (!col) return null;

              return (
                <li key={key}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={visibleUserCols.includes(key)} onChange={() => toggleColumn(key)} />
                    {col.label}
                  </label>
                </li>
              );
            })}
      </ul>
    </div>
  );
}
