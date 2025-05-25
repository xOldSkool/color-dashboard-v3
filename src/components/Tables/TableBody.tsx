import { BaseItem, TableBodyProps } from '@/types/tablesTypes';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import HexToBoxColor from '../HexToBoxColor';
import { JSX } from 'react';

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
  return (
    <>
      <div className="grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] border-b border-dashed border-[var(--border)] text-center uppercase font-semibold bg-[var(--hover-btn-ghost)] py-4 rounded-t-xl">
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

      {data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((item) => {
        const id = item._id.toString();
        return (
          <div
            key={id}
            onClick={() => toggleSelection(id)}
            data-selected={isSelected(id)}
            className="grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] items-center text-center py-2 odd:bg-[var(--hover-btn-ghost)] data-[selected=true]:bg-[var(--selected-row)] hover:bg-[var(--selected-row)] cursor-pointer border-b-1 border-transparent data-[selected=true]:border-b-1 data-[selected=true]:border-dashed data-[selected=true]:border-[var(--border)]"
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
              const isMovimenti = col.key === 'movimentiMagazzino';
              const isHex = col.key === 'hex';

              return (
                <div key={col.key} className={`px-2 ${isBasi || isMovimenti ? 'text-left items-start' : 'text-center justify-center'} flex`}>
                  {isHex && 'hex' in item ? (
                    <HexToBoxColor hex={item.hex} />
                  ) : isBasi && 'basi' in item && Array.isArray(item.basi) && item.basi.filter((base) => base.valore > 0).length ? (
                    <div className="flex flex-col justify-center">
                      {tableKey === 'da-produrre' && item.qtDaProdurre && item.dose && (
                        <div className="flex flex-col mb-1 self-start text-xs gap-1">
                          <span className="text-[var(--primary)] bg-[var(--background)] border border-[var(--primary)] px-2 py-0.5 rounded-md w-fit">
                            {(item.qtDaProdurre / item.dose).toFixed(3)} dosi
                          </span>
                          {item.battuteDaProdurre && (
                            <span className="text-[var(--primary)] bg-[var(--background)] border border-[var(--primary)] px-2 py-0.5 rounded-md w-fit">
                              {item.battuteDaProdurre} battute
                            </span>
                          )}
                        </div>
                      )}
                      {item.basi
                        .filter((base) => base.valore > 0)
                        .map((base) => {
                          const totale =
                            tableKey === 'da-produrre' && item.qtDaProdurre
                              ? ((base.valore * item.qtDaProdurre) / item.dose).toFixed(3)
                              : base.valore.toFixed(3);
                          return (
                            <div key={base.nome} className="text-sm">
                              <span className="font-bold">{base.label}</span>: {totale}
                            </div>
                          );
                        })}
                    </div>
                  ) : isMovimenti && 'movimentiMagazzino' in item && Array.isArray(item.movimentiMagazzino) && item.movimentiMagazzino.length ? (
                    <div className="flex flex-col text-sm">
                      {item.movimentiMagazzino.map((mov, index) => (
                        <div key={index}>
                          <span className="font-bold">{mov.tipo}</span> • {mov.quantita} pz •{' '}
                          <span className="italic">{new Date(mov.data).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    item[col.key as keyof T]?.toString() || '-'
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
