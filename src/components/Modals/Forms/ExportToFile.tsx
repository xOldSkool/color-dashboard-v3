import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import Button from '@/components/Button';
import { Download } from 'lucide-react';

interface ExportColumn {
  key: string;
  label: string;
}

interface ExportToFileProps {
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  tableKey?: string;
}

export default function ExportToFile({ columns, rows, tableKey }: ExportToFileProps) {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const handleDownload = () => {
    const header = columns.map((col) => col.label);
    const keys = columns.map((col) => col.key);
    const data = rows.map((row) => keys.map((key) => row[key]));

    const ws = utils.aoa_to_sheet([header, ...data]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Dati');
    const baseName = tableKey ? `${tableKey}-export` : 'export';
    if (format === 'xlsx') {
      writeFile(wb, `${baseName}.xlsx`);
    } else {
      writeFile(wb, `${baseName}.csv`);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-lg">Seleziona il formato con il quale generare il file.</p>
      <div className="flex flex-row gap-4 self-center items-center">
        <select
          className="border-1 border-dashed border-[var(--border)] hover:border-[var(--hover)] rounded-lg bg-[var(--background)] cursor-pointer p-2 text-lg focus:outline-none"
          value={format}
          onChange={(e) => setFormat(e.target.value as 'xlsx' | 'csv')}
        >
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="csv">CSV (.csv)</option>
        </select>
      </div>
      <Button variant="primary" icon={Download} className="self-center mt-5" onClick={handleDownload}>
        Scarica file
      </Button>
    </div>
  );
}
