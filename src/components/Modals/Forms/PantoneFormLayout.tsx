import React from 'react';
import InputMap from '@/components/InputMap';
import Loader from '@/components/Loader';
import { H3 } from '@/components/UI/Titles&Texts';
import { pantoneFieldsLeft, pantoneFieldsCenter, pantoneNotes } from '@/constants/inputFields';
import { BaseMateriale } from '@/types/materialeTypes';
import { Materiale } from '@/types/materialeTypes';

export interface PantoneFormLayoutProps {
  formData: Record<string, string | number | undefined>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errorMessage?: string | null;
  fieldErrors?: Record<string, string | undefined>; // AGGIUNTA: errori campo per campo
  pantoneMateriali?: Materiale[];
  pantoneEsternoSelezionato?: string | null;
  setPantoneEsternoSelezionato?: (id: string | null) => void;
  loadingPantoniMateriali?: boolean;
  basiRaggruppatePerName?: Record<string, BaseMateriale[]>;
  basi?: BaseMateriale[];
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
}

/**
 * Layout riutilizzabile per i form Pantone (nuovo, duplicato, modifica)
 * Props:
 * - formData, handleChange, errorMessage
 * - pantoneMateriali, pantoneEsternoSelezionato, setPantoneEsternoSelezionato, loadingPantoniMateriali
 * - basiRaggruppatePerName, basi, loading, error
 * - children: opzionale, per aggiungere altri elementi custom
 */
export default function PantoneFormLayout({
  formData,
  handleChange,
  errorMessage,
  fieldErrors = {},
  pantoneMateriali = [],
  pantoneEsternoSelezionato = null,
  setPantoneEsternoSelezionato,
  loadingPantoniMateriali = false,
  basiRaggruppatePerName = {},
  basi = [],
  loading = false,
  error = null,
  children,
}: PantoneFormLayoutProps) {
  const tipoSelezionato = typeof formData['tipo'] === 'string' ? formData['tipo'] : undefined;

  return (
    <form className="w-6xl">
      <div className="flex flex-row justify-between">
        <H3 className="mb-2">Dettagli Pantone</H3>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {/* Select Pantone Esterno */}
        {pantoneMateriali.length > 0 && setPantoneEsternoSelezionato && (
          <div className="mb-4 flex flex-row items-center border border-dashed border-[var(--border)] rounded-xl px-2">
            <label className="font-semibold mr-2">Importa pantone esterno:</label>
            <select
              className="p-2 rounded bg-zinc-700 text-white focus:outline-none"
              onChange={(e) => setPantoneEsternoSelezionato(e.target.value || null)}
              value={pantoneEsternoSelezionato || ''}
              disabled={loadingPantoniMateriali}
            >
              {loadingPantoniMateriali ? (
                <option value="" disabled>
                  Caricamento...
                </option>
              ) : (
                <>
                  <option value="">Seleziona un pantone...</option>
                  {pantoneMateriali.map((m) => (
                    <option key={m._id?.toString()} value={m._id?.toString()}>
                      {m.label} - {m.fornitore}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-3 gap-2">
          <InputMap fields={pantoneFieldsLeft} formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} />
          <InputMap fields={pantoneFieldsCenter} formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} />
          <InputMap fields={pantoneNotes} formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold mt-5">Composizione</h2>
          {pantoneEsternoSelezionato && (
            <div className="mb-4 flex flex-col">
              {/* Pantone esterno input */}
              {(() => {
                const pantoneEsterno = pantoneMateriali.find((m) => m._id?.toString() === pantoneEsternoSelezionato);
                if (!pantoneEsterno) return null;
                return (
                  <label className="mb-1">
                    {pantoneEsterno.label}
                    <span className="ml-2 text-sm text-neutral-300 italic">{pantoneEsterno.fornitore}</span>
                  </label>
                );
              })()}
              <input
                type="number"
                name="pantoneEsternoInput"
                className="w-32 p-2 rounded bg-zinc-600 text-white focus:outline-none"
                value={formData.pantoneEsternoInput ?? ''}
                onChange={handleChange}
                min={0}
                step={0.01}
              />
            </div>
          )}
          {/* Basi section (always shown) */}
          {tipoSelezionato ? (
            loading ? (
              <Loader />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : basi.length === 0 ? (
              <p className="text-neutral-400 italic">Nessuna base disponibile per questo &quot;Tipo&quot;.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(basiRaggruppatePerName).map(([nome, basi]) => {
                  const fornitoriDisponibili = basi.map((b) => ({
                    id: b._id!.toString(),
                    label: b.label,
                    fornitore: b.fornitore,
                    codiceColore: b.codiceColore,
                  }));
                  const label = basi[0].label || nome;
                  return (
                    <div key={nome}>
                      <label>
                        {label}
                        <span className="text-sm">
                          {fornitoriDisponibili.length > 1 ? (
                            <select
                              name={`fornitore_${nome}`}
                              className="ml-2 rounded bg-zinc-800 text-white italic focus:outline-none"
                              onChange={handleChange}
                              value={formData[`fornitore_${nome}`] || ''}
                            >
                              <option value="">Seleziona fornitore</option>
                              {fornitoriDisponibili.map((f) => (
                                <option key={f.id} value={f.fornitore}>
                                  {f.fornitore} - {f.codiceColore}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="ml-2 text-sm text-neutral-300 italic">
                              {fornitoriDisponibili[0].fornitore} - {fornitoriDisponibili[0].codiceColore}
                            </span>
                          )}
                        </span>
                      </label>
                      <input
                        name={`valore_${nome}`}
                        type="number"
                        placeholder="0"
                        className="w-full p-2 rounded bg-zinc-600 text-white focus:outline-none mt-1"
                        value={formData[`valore_${nome}`] || ''}
                        onChange={handleChange}
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <p className="text-neutral-400 italic">Seleziona un &quot;Tipo&quot; per vedere le basi disponibili.</p>
          )}
        </div>
        {children}
      </div>
    </form>
  );
}
