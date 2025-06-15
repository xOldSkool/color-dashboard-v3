'use client';
import { useState } from 'react';
import { Table } from '@/components/ClientWrapper';
import { CONFIG_INVENTARIO } from '@/constants/defaultColumns';
import { useSalvaInventario } from '@/hooks/useSalvaInventario';
import InventarioActions from './actions';
import { utils, writeFile } from 'xlsx';
import type { Materiale } from '@/types/materialeTypes';
import { toast } from 'react-toastify';

export default function InventarioClient({ materiali }: { materiali: Materiale[] }) {
  const [quantitaReale, setQuantitaReale] = useState<Record<string, number>>({});
  const [quantitaDaOrdinare, setQuantitaDaOrdinare] = useState<Record<string, number>>({});
  const { salvaInventario, isSaving } = useSalvaInventario();

  // Salva
  const handleSalva = async () => {
    const modifiche = Object.entries(quantitaReale)
      .filter(([, val]) => val !== undefined && val !== null)
      .map(([id, quantitaReale]) => ({ id, quantitaReale }));
    if (modifiche.length === 0) {
      toast.warn('Inserisci almeno una quantità reale prima di salvare.');
      return;
    }
    const ok = await salvaInventario(modifiche);
    if (ok) setQuantitaReale({});
  };

  // Esporta
  const handleEsporta = () => {
    const rows = materiali
      .filter((mat) => quantitaDaOrdinare[mat._id?.toString() ?? ''] && quantitaDaOrdinare[mat._id?.toString() ?? ''] !== 0)
      .map((mat) => ({
        ...mat,
        quantitaDaOrdinare: quantitaDaOrdinare[mat._id?.toString() ?? ''],
      }));
    if (rows.length === 0) {
      toast.warn('Nessun materiale con quantità da ordinare maggiore di zero da esportare.');
      return;
    }
    const columns = [...CONFIG_INVENTARIO, 'quantitaDaOrdinare'] as (keyof Materiale | 'quantitaDaOrdinare')[];
    const data = rows.map((row) => {
      const filtered: Record<string, unknown> = {};
      columns.forEach((col) => {
        filtered[col] = (row as Record<string, unknown>)[col];
      });
      return filtered;
    });
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Dati');
    writeFile(wb, 'inventario-da-ordinare.xlsx');
    setQuantitaDaOrdinare({});
  };

  // Wrapper per input custom inventario
  const handleChangeQuantitaReale = (id: string, value: number) => {
    setQuantitaReale((prev) => ({ ...prev, [id]: value }));
  };
  const handleChangeQuantitaDaOrdinare = (id: string, value: number) => {
    setQuantitaDaOrdinare((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <>
      <Table
        items={materiali}
        config={CONFIG_INVENTARIO}
        tableKey="inventario"
        rows={50}
        quantitaReale={quantitaReale}
        quantitaDaOrdinare={quantitaDaOrdinare}
        onChangeQuantitaReale={handleChangeQuantitaReale}
        onChangeQuantitaDaOrdinare={handleChangeQuantitaDaOrdinare}
      />
      <InventarioActions onSalva={handleSalva} onEsporta={handleEsporta} isSaving={isSaving} />
    </>
  );
}
