import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import Button from '@/components/Button';
import { Download } from 'lucide-react';

interface ExportToFileProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

export default function ExportToFile({ columns, rows }: ExportToFileProps) {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const handleDownload = () => {
    const data = rows.map((row) => {
      const filtered: Record<string, unknown> = {};
      columns.forEach((col) => {
        filtered[col] = row[col];
      });
      return filtered;
    });
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Dati');
    if (format === 'xlsx') {
      writeFile(wb, 'export.xlsx');
    } else {
      writeFile(wb, 'export.csv');
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-lg">Seleziona il formato con il quale generare il file.</p>
      <div className="flex flex-row gap-4 self-center items-center">
        {/* <label className="text-lg">Formato:</label> */}
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
