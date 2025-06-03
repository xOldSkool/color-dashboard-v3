'use client';
import { BaseItem, TableBodyProps } from '@/types/tablesTypes';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import HexToBoxColor from '../HexToBoxColor';
import { JSX } from 'react';
import dateToItalia from '@/utils/dateToItalia';

export default function TableBody<T extends BaseItem>({
  data,
  visibleColumns,
  sortKey,
  sortOrder,
  handleSort,
  toggleSelection,
  isSelected,
  allSelected,
  selectAll,
  clearAll,
  allIds,
  tableKey,
  currentPage,
  rowsPerPage,
}: TableBodyProps<T>): JSX.Element {
  // Porta in cima gli elementi urgenti
  const sortedData = [
    ...data.filter((item) => 'urgente' in item && item.urgente === true),
    ...data.filter((item) => !('urgente' in item && item.urgente === true)),
  ];

  return (
    <>
      <div className="grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] border-b border-dashed border-[var(--border)] text-center uppercase font-semibold bg-[var(--hover-btn-ghost)] py-4 rounded-t-xl sticky top-0 z-10">
        <input type="checkbox" checked={allSelected} onChange={() => (allSelected ? clearAll() : selectAll(allIds))} className="m-auto size-4" />
        {visibleColumns.map((col) => (
          <div key={col.key.toString()} onClick={() => handleSort(col.key)} className="flex items-center justify-center cursor-pointer mx-1">
            {col.label}
            <span className="inline-block ms-1">
              {sortKey === col.key ? (
                sortOrder === 'asc' ? (
                  <ArrowDownAZ className="size-5" />
                ) : (
                  <ArrowUpAZ className="size-5" />
                )
              ) : (
                <ArrowDownAZ className="size-5 opacity-30" />
              )}
            </span>
          </div>
        ))}
      </div>

      {sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((item) => {
        const id = item._id!.toString();
        // Evidenzia la riga se urgente=true
        const isUrgente = 'urgente' in item && item.urgente === true;
        return (
          <div
            key={id}
            onClick={() => toggleSelection(id)}
            data-selected={isSelected(id)}
            className={`grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] items-center text-center py-2 odd:bg-[var(--hover-btn-ghost)] data-[selected=true]:bg-[var(--selected-row)] hover:bg-[var(--selected-row)] cursor-pointer border-b-1 border-transparent data-[selected=true]:border-b-1 data-[selected=true]:border-dashed data-[selected=true]:border-[var(--border)] ${isUrgente ? 'bg-red-200 dark:bg-red-900/60' : ''}`}
          >
            <input
              type="checkbox"
              checked={isSelected(id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelection(id);
              }}
              className="m-auto size-4"
            />

            {visibleColumns.map((col) => {
              const isBasi = col.key === 'basi';
              const isHex = col.key === 'hex';
              const isUV = col.key === 'tipo';
              const isMovimentiMateriali = col.key === 'movimenti';
              const isMovimentiMaterialeSingolo = tableKey === 'movimenti-materiale';

              return (
                <div
                  key={col.key}
                  className={`px-2 ${isBasi || isMovimentiMateriali ? 'text-left items-start' : 'text-center justify-center'} flex${isMovimentiMaterialeSingolo ? ' text-center justify-center' : ''}`}
                >
                  {isHex && 'hex' in item ? (
                    <HexToBoxColor hex={item.hex!} />
                  ) : isMovimentiMaterialeSingolo && col.key === 'data' && 'data' in item && item.data ? (
                    <span>{new Date(item.data).toLocaleDateString()}</span>
                  ) : isMovimentiMateriali && 'movimenti' in item && Array.isArray(item.movimenti) && item.movimenti.length ? (
                    <div className="flex flex-col text-sm">
                      {item.movimenti.map((mov, index) => (
                        <div key={index}>
                          <span className="font-bold">{mov.tipo}</span> • {mov.quantita} kg •{' '}
                          <span className="italic">{new Date(mov.data).toLocaleDateString()}</span>
                          {mov.causale && <span> • {mov.causale}</span>}
                        </div>
                      ))}
                    </div>
                  ) : isBasi && 'basi' in item && Array.isArray(item.basi) && item.basi.filter((base) => base.quantita > 0).length ? (
                    <div className="flex flex-col justify-center">
                      {tableKey === 'da-produrre' && item.qtDaProdurre && item.dose && (
                        <div className="flex flex-col mb-1 self-start text-xs gap-1">
                          <span className="text-[var(--text-inverted)] bg-[var(--foreground)] px-2 py-0.5 rounded-md w-fit">
                            {(item.qtDaProdurre / item.dose).toFixed(1).replace('.', ',')} dosi
                          </span>
                          {item.battuteDaProdurre && (
                            <span className="text-[var(--text-inverted)] bg-[var(--foreground)] px-2 py-0.5 rounded-md w-fit">
                              {item.battuteDaProdurre} battute
                            </span>
                          )}
                        </div>
                      )}
                      {item.basi
                        .filter((base) => base.quantita > 0)
                        .map((base) => {
                          const totale =
                            tableKey === 'da-produrre' && item.qtDaProdurre
                              ? ((base.quantita * item.qtDaProdurre) / item.dose).toFixed(3)
                              : base.quantita.toFixed(3);
                          // Sostituisci il punto con la virgola per la visualizzazione italiana
                          const totaleIT = totale.replace('.', ',');
                          return (
                            <div key={base.nomeMateriale} className="text-sm">
                              <span className="font-bold">{base.label}</span>: {totaleIT}
                            </div>
                          );
                        })}
                    </div>
                  ) : isUV ? (
                    <span className={item[col.key as keyof T] === 'UV' ? 'text-purple-500' : ''}>
                      {dateToItalia(col.key as string, item[col.key as keyof T]) || '-'}
                    </span>
                  ) : typeof item[col.key as keyof T] === 'object' && item[col.key as keyof T] !== null ? (
                    <span className="italic text-gray-400">-</span>
                  ) : (
                    dateToItalia(col.key as string, item[col.key as keyof T]) || '-'
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
