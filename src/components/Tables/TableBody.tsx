'use client';
import { BaseItem, TableBodyProps } from '@/types/tablesTypes';
import HexToBoxColor from '../HexToBoxColor';
import { JSX } from 'react';
import dateToItalia from '@/utils/dateToItalia';

export default function TableBody<T extends BaseItem>({
  data,
  visibleColumns,
  toggleSelection,
  isSelected,
  tableKey,
  currentPage,
  rowsPerPage,
}: Omit<TableBodyProps<T>, 'sortKey' | 'sortOrder' | 'handleSort' | 'allSelected' | 'selectAll' | 'clearAll' | 'allIds'>): JSX.Element {
  // Porta in cima gli elementi urgenti SOLO se tableKey === 'da-produrre'
  const sortedData =
    tableKey === 'da-produrre'
      ? [
          ...data.filter((item) => 'urgente' in item && item.urgente === true),
          ...data.filter((item) => !('urgente' in item && item.urgente === true)),
        ]
      : data;

  return (
    <>
      {sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((item) => {
        const id = item._id!.toString();
        // Evidenzia la riga se urgente=true SOLO se tableKey === 'da-produrre'
        const isUrgente = tableKey === 'da-produrre' && 'urgente' in item && item.urgente === true;
        return (
          <div
            key={id}
            onClick={() => toggleSelection(id)}
            data-selected={isSelected(id)}
            className={`row-interactive grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] items-center text-center py-2  ${isUrgente ? 'bg-red-200 dark:bg-red-900/60' : ''}`}
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
                              <span className="font-semibold">{base.label}</span>: {totaleIT} kg
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
