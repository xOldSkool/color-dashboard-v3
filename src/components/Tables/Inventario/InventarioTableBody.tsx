import React from 'react';
import type { Materiale } from '@/types/materialeTypes';
import type { TableColumn } from '@/types/constantsTypes';

interface InventarioTableBodyProps {
  materiali: Materiale[];
  visibleColumns: TableColumn[];
  currentPage: number;
  rowsPerPage: number;
  quantitaReale: Record<string, number>;
  quantitaDaOrdinare: Record<string, number>;
  onChangeQuantitaReale: (id: string, value: number) => void;
  onChangeQuantitaDaOrdinare: (id: string, value: number) => void;
}

export default function InventarioTableBody({
  materiali,
  visibleColumns,
  currentPage,
  rowsPerPage,
  quantitaReale,
  quantitaDaOrdinare,
  onChangeQuantitaReale,
  onChangeQuantitaDaOrdinare,
}: InventarioTableBodyProps) {
  const paginatedData = materiali.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  if (paginatedData.length === 0) {
    return (
      <div className="row-interactive grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] items-center text-center py-2">
        <div className="col-span-full w-full text-[var(--text)] text-center py-2">Nessun materiale presente</div>
      </div>
    );
  }

  return (
    <>
      {paginatedData.map((mat) => {
        const id = mat._id?.toString() ?? '';
        return (
          <div key={id} className={'row-interactive grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] items-center text-center py-2'}>
            {/* Checkbox placeholder per allineamento */}
            <div></div>
            {visibleColumns.map((col) => {
              const value = (mat as unknown as Record<string, unknown>)[col.key];
              return (
                <div key={col.key} className="px-2 text-center justify-center flex">
                  {typeof value === 'string' || typeof value === 'number' ? value : '-'}
                </div>
              );
            })}
            <div className="text-center justify-center flex">
              <input
                type="number"
                className="w-24 text-center bg-[var(--secondary)] text-[var(--text)] rounded-md input-no-spinner"
                value={quantitaReale[id] === undefined ? '' : quantitaReale[id]}
                onChange={(e) => onChangeQuantitaReale(id, Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="text-center justify-center flex">
              <input
                type="number"
                className="w-24 text-center bg-[var(--secondary)] text-[var(--text)] rounded-md input-no-spinner"
                value={quantitaDaOrdinare[id] === undefined ? '' : quantitaDaOrdinare[id]}
                onChange={(e) => onChangeQuantitaDaOrdinare(id, Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
