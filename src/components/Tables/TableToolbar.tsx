'use client';
import {
  ArchiveRestore,
  CircleCheckBig,
  ClipboardList,
  Columns3Cog,
  Copy,
  ListFilter,
  PackageMinus,
  PackagePlus,
  PaintBucket,
  Send,
  SquarePen,
  Trash2,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { BaseItem, TableToolbarProps } from '@/types/tablesTypes';
import { JSX } from 'react';
import { useTableStore } from '@/store/useTableStore';
import { useModalStore } from '@/store/useModalStore';
import Button from '@/components/Button';
import { useHandleTableToolbarAction } from '@/hooks/useHandleTableToolbarAction';

export default function TableToolbar<T extends BaseItem>({ data, rowsPerPage, setRowsPerPage, tableKey }: TableToolbarProps<T>): JSX.Element {
  const { searchQuery, setSearchQuery, selectedRows, setSelectedTableKey } = useTableStore();
  const { openModal } = useModalStore();
  const { handleAction } = useHandleTableToolbarAction(data);
  const router = useRouter();

  const handleViewClick = () => {
    if (selectedRows.length === 1) {
      const selectedId = selectedRows[0];
      let path = '';
      if (tableKey === 'materiali') {
        path = `/materiali/${selectedId}`;
      } else if (tableKey === 'magazzino' || tableKey === 'magazzino-pantoni') {
        const selectedItem = data.find((item) => item._id === selectedId) as { pantoneGroupId?: string };
        path = `/magazzino/${selectedItem?.pantoneGroupId || selectedId}`;
      } else {
        path = `/pantone/${selectedId}`;
      }
      router.push(path);
    } else {
      alert('Seleziona un solo elemento da visualizzare!');
    }
  };

  const handleSelectColumnsClick = () => {
    setSelectedTableKey(tableKey);
    openModal('selectColumns');
  };

  const handleExportClick = () => {
    const visibleCols = useTableStore.getState().getVisibleUserCols(tableKey);
    openModal('exportToFile', { columns: visibleCols, rows: data, tableKey: tableKey });
  };

  return (
    <>
      <div className="flex flex-row items-center justify-between py-6">
        <div className="flex flex-row items-center gap-2">
          {/* Mostra la search anche per inventario */}
          <input
            type="search"
            name="cerca"
            id="cerca"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--background)] border-1 border-dashed border-[var(--border)] rounded-lg p-2 w-72"
            placeholder="Cerca nell'elenco"
          />
          {/* Mostra il pulsante filtri solo se NON è inventario */}
          {tableKey !== 'inventario' && (
            <div>
              <Button modalKey="filterPantone" tooltip="Filtri" icon={ListFilter} variant="toolbar" iconClass={'size-8 hover:text-[var(--accent)]'} />
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-row items-center gap-2">
            {/* Solo colonne e select righe per inventario */}
            {tableKey === 'inventario' ? (
              <>
                <Button
                  icon={Columns3Cog}
                  tooltip="Modifica colonne"
                  modalKey="selectColumns"
                  variant="toolbar"
                  iconClass={'size-8 hover:text-[var(--accent)]'}
                  onClick={handleSelectColumnsClick}
                />
                <div>
                  <select
                    className="h-9 border-1 border-dashed border-[var(--border)] hover:border-[var(--hover)] rounded-lg bg-[var(--background)] cursor-pointer"
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    value={rowsPerPage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {(tableKey === 'ricettario' || tableKey === 'magazzino') && (
                  <Button
                    icon={PaintBucket}
                    tooltip="Componi"
                    variant="toolbar"
                    iconClass={'size-8 hover:text-[var(--accent)]'}
                    onClick={() => handleAction('producePantone')}
                  ></Button>
                )}
                {tableKey !== 'materiali' &&
                  tableKey !== 'movimenti-materiale' &&
                  tableKey !== 'da-produrre' &&
                  tableKey !== 'consegnati-produzione' &&
                  tableKey !== 'magazzino-pantoni' && (
                    <Button
                      icon={Send}
                      tooltip="Consegna"
                      variant="toolbar"
                      iconClass={'size-8 hover:text-[var(--accent)]'}
                      onClick={() => handleAction('deliverPantone')}
                    ></Button>
                  )}
                {tableKey === 'da-produrre' && (
                  <Button
                    iconName="transfer"
                    tooltip="Trasferisci"
                    variant="toolbar"
                    iconClass="size-8 hover:text-[var(--accent)]"
                    onClick={() => handleAction('transferPantone')}
                  ></Button>
                )}
                {tableKey === 'materiali' && (
                  <>
                    <Button
                      icon={PackagePlus}
                      tooltip="Carico"
                      variant="toolbar"
                      iconClass="size-8 hover:text-[var(--accent)]"
                      onClick={() => handleAction('loadMateriale', 1, 1, 'materiali')}
                    />
                    <Button
                      icon={PackageMinus}
                      tooltip="Scarico"
                      variant="toolbar"
                      iconClass="size-8 hover:text-[var(--accent)]"
                      onClick={() => handleAction('unloadMateriale', 1, 1, 'materiali')}
                    />
                  </>
                )}
                {tableKey !== 'movimenti-materiale' && (
                  <Button
                    icon={ClipboardList}
                    tooltip="Apri scheda"
                    variant="toolbar"
                    iconClass={'size-8 hover:text-[var(--accent)]'}
                    onClick={handleViewClick}
                  ></Button>
                )}
                {tableKey === 'ricettario' && (
                  <Button
                    icon={SquarePen}
                    tooltip="Modifica"
                    variant="toolbar"
                    iconClass={'size-8 hover:text-[var(--accent)]'}
                    onClick={() => handleAction('editPantone')}
                  ></Button>
                )}
                {tableKey === 'materiali' && (
                  <Button
                    icon={SquarePen}
                    tooltip="Modifica"
                    variant="toolbar"
                    iconClass={'size-8 hover:text-[var(--accent)]'}
                    onClick={() => handleAction('editMateriale', 1, 1, 'materiali')}
                  />
                )}

                {tableKey === 'ricettario' && (
                  <Button
                    icon={Copy}
                    tooltip="Duplica"
                    variant="toolbar"
                    iconClass="size-8 hover:text-[var(--accent)]"
                    onClick={() => handleAction('duplicatePantone')}
                  />
                )}
                {tableKey === 'consegnati-produzione' && (
                  <Button
                    icon={ArchiveRestore}
                    tooltip="Rientro Magazzino"
                    variant="toolbar"
                    iconClass={'size-8 hover:text-[var(--accent)]'}
                    onClick={() => handleAction('returnPantone')}
                  ></Button>
                )}
                {tableKey === 'consegnati-produzione' && (
                  <Button
                    icon={CircleCheckBig}
                    tooltip="Consumato"
                    variant="toolbar"
                    iconClass={'size-8 hover:text-[var(--accent)]'}
                    onClick={() => handleAction('markPantoneAsConsumed')}
                  ></Button>
                )}
                {tableKey === 'ricettario' && (
                  <Button
                    icon={Trash2}
                    tooltip="Elimina"
                    variant="toolbar"
                    iconClass="size-8 hover:text-red-700"
                    onClick={() => handleAction('deletePantone', 1, Infinity)}
                  ></Button>
                )}
                {tableKey === 'da-produrre' && (
                  <Button
                    icon={Trash2}
                    tooltip="Rimuovi"
                    variant="toolbar"
                    iconClass="size-8 hover:text-red-700"
                    onClick={() => handleAction('removeFromToProduce')}
                  />
                )}
                <Button
                  icon={Columns3Cog}
                  tooltip="Modifica colonne"
                  modalKey="selectColumns"
                  variant="toolbar"
                  iconClass={'size-8 hover:text-[var(--accent)]'}
                  onClick={handleSelectColumnsClick}
                ></Button>
                {tableKey !== 'da-produrre' && tableKey !== 'consegnati-produzione' && (
                  <Button
                    iconName="file"
                    tooltip="Esporta"
                    variant="toolbar"
                    iconClass="size-8 hover:text-[var(--accent)]"
                    onClick={handleExportClick}
                  />
                )}
                <div>
                  <select
                    className="h-9 border-1 border-dashed border-[var(--border)] hover:border-[var(--hover)] rounded-lg bg-[var(--background)] cursor-pointer"
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    value={rowsPerPage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
