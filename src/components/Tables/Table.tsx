'use client';
import {
  MAGAZZINO_PANTONI_COLUMNS,
  MATERIALI_COLUMNS,
  MOVIMENTI_MAGAZZINO_COLUMNS,
  MOVIMENTI_MATERIALE_COLUMNS,
  PANTONE_COLUMNS,
} from '@/constants/defaultColumns';
import { JSX, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import TablePagination from './TablePagination';
import { BaseItem, TableProps } from '@/types/tablesTypes';
import { useTableStore } from '@/store/useTableStore';
import { TableColumn } from '@/types/constantsTypes';
import TableBody from './TableBody';
import TableToolbar from './TableToolbar';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

// USO DEL COMPONENTE TABLE:
// <Table
//   items={[]}               // array di oggetti da visualizzare (pantoni o materiali)
//   config={[]}              // array di colonne visibili (es. ['nomePantone', 'cliente', ...])
//   tableKey="pantoni"       // chiave della tabella per gestire colonne, filtri e comportamenti (es. 'pantoni', 'materiali')
//   rows={25}                // numero di righe per pagina (opzionale, default: 25)
//   filterFn={(item) => ...} // funzione personalizzata di filtro degli item (opzionale)
// />

// ➤ La tabella mostra solo le colonne presenti in `config`, basandosi su `PANTONE_COLUMNS` o `MATERIALI_COLUMNS`.
// ➤ Applica filtri dinamici a seconda del `tableKey` (es. solo urgenti, solo da produrre, ecc.).
// ➤ Supporta ricerca su tutti i campi visibili e sulle basi.
// ➤ Ogni colonna è ordinabile cliccando sull’intestazione.
// ➤ Le righe sono selezionabili con checkbox e evidenziate se selezionate.
// ➤ Supporta impaginazione e gestione del numero di righe per pagina.
// ➤ Integra componenti esterni come:
//     - TableToolbar: barra superiore con filtri, ricerca e azioni
//     - TablePagination: navigazione tra le pagine
//     - HexToBoxColor: renderizzazione visiva del colore da codice hex

export default function Table<T extends BaseItem>({ items = [], config = [], tableKey, rows, filterFn }: TableProps<T>): JSX.Element {
  const data = items;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | number>(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { selectedRows, toggleSelection, isSelected, selectAll, clearAll, searchQuery, setVisibleUserCols, getVisibleUserCols } = useTableStore();
  const pathname = usePathname();
  const defaultRows = rows ?? 25;
  const [rowsPerPage, setRowsPerPage] = useState(defaultRows);
  const visibleUserCols = getVisibleUserCols(tableKey);

  useEffect(() => {
    if (rows && rows !== rowsPerPage) {
      setRowsPerPage(rows);
    }
  }, [rows, rowsPerPage]);

  useEffect(() => {
    setVisibleUserCols(tableKey, config);
  }, [config, tableKey, setVisibleUserCols]);

  useEffect(() => {
    clearAll();
  }, [pathname, clearAll]);

  const handleSort = (key: string | number) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const ALL_COLUMNS: TableColumn[] =
    tableKey === 'materiali'
      ? MATERIALI_COLUMNS
      : tableKey === 'movimenti-materiale'
        ? MOVIMENTI_MATERIALE_COLUMNS
        : tableKey === 'magazzino-pantoni'
          ? MAGAZZINO_PANTONI_COLUMNS
          : tableKey === 'movimenti-magazzino'
            ? MOVIMENTI_MAGAZZINO_COLUMNS
            : PANTONE_COLUMNS;

  const visibleColumns: TableColumn[] = visibleUserCols
    .map((key) => ALL_COLUMNS.find((col) => col.key === key))
    .filter((col): col is TableColumn => Boolean(col));

  const filteredByTable: T[] = data.filter((item) => {
    if (filterFn) return filterFn(item);
    if (tableKey === 'da-produrre' && 'daProdurre' in item) return item.daProdurre === true;
    if (tableKey === 'consegnati-produzione' && 'consegnatoProduzione' in item) return item.consegnatoProduzione === true;
    if (tableKey === 'urgenti' && 'urgente' in item) return true;
    return true;
  });

  const queriedData: T[] = filteredByTable.filter((item) => {
    const matchesColumns = visibleColumns.some((col) => {
      const value = item[col.key as keyof T];
      return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });

    const matchesBasi =
      'basi' in item &&
      Array.isArray(item.basi) &&
      item.basi.filter((b) => b.quantita > 0).some((b) => b.label?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesColumns || matchesBasi;
  });

  // Applica ordinamento per sortKey/sortOrder
  let sortedData: T[] = [...queriedData].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = a[sortKey as keyof T];
    const bValue = b[sortKey as keyof T];
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  // Porta in cima gli urgenti SOLO se tableKey === 'da-produrre'
  if (tableKey === 'da-produrre') {
    sortedData = [
      ...sortedData.filter((item) => 'urgente' in item && item.urgente === true),
      ...sortedData.filter((item) => !('urgente' in item && item.urgente === true)),
    ];
  }

  const allIds: string[] = sortedData.map((item) => item._id!.toString());
  const allSelected: boolean = allIds.every((id) => selectedRows.includes(id));

  return (
    <>
      <div className="">
        {/* Sticky wrapper per toolbar + header */}
        <div className="sticky top-0 z-20 bg-[var(--background)] ">
          <TableToolbar data={sortedData} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} tableKey={tableKey} />
          {/* HEADER TABELLA */}
          <div className="grid grid-cols-[50px_repeat(auto-fit,_minmax(50px,_1fr))] border border-dashed border-[var(--border)] text-center uppercase font-semibold bg-[var(--hover-foreground)] py-4 rounded-t-xl">
            <input type="checkbox" checked={allSelected} onChange={() => (allSelected ? clearAll() : selectAll(allIds))} className="m-auto size-4" />
            {visibleColumns.map((col) => (
              <div
                key={col.key.toString()}
                onClick={() => handleSort(col.key)}
                className="flex items-center justify-center cursor-pointer hover:text-[var(--accent)] mx-1"
              >
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
        </div>
        {/* BODY TABELLA */}
        <TableBody
          data={sortedData}
          visibleColumns={visibleColumns}
          toggleSelection={toggleSelection}
          isSelected={isSelected}
          tableKey={tableKey}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
        />
      </div>
      <TablePagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalItems={sortedData.length} rowsPerPage={rowsPerPage} />
    </>
  );
}
