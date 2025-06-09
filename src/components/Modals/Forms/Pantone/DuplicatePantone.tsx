'use client';
import InputMap from '@/components/InputMap';
import Loader from '@/components/Loader';
import { pantoneFieldsCenter, pantoneFieldsLeft, pantoneNotes } from '@/constants/inputFields';
import { useBasiMateriali, usePantoneMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { useModalStore } from '@/store/useModalStore';
import { BaseMateriale } from '@/types/materialeTypes';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Pantone } from '@/types/pantoneTypes';
import { pantoneToFormData } from '@/lib/adapter';
import { getEnumValue } from '@/utils/getEnumValues';
import { useRouter } from 'next/navigation';
import { H3 } from '@/components/UI/Titles&Texts';

interface DuplicatePantoneProps {
  pantone: Pantone;
}

export default function DuplicatePantone({ pantone }: DuplicatePantoneProps) {
  const router = useRouter();
  const { createPantone } = useCreatePantone();
  const [formData, setFormData] = useState<Record<string, string | number | undefined>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pantoneEsternoSelezionato, setPantoneEsternoSelezionato] = useState<string | null>(null);

  const { pantoneMateriali, loading: loadingPantoniMateriali } = usePantoneMateriali();

  // Precaricamento formData con pantone originale e gestione pantone esterno
  useEffect(() => {
    if (pantone) {
      // Escludi la proprietà dose dal formData iniziale
      const formDataOriginale = pantoneToFormData(pantone);
      const fd = { ...formDataOriginale };
      delete fd.dose;
      // Cerca la base con utilizzo Pantone
      const basePantone = Array.isArray(pantone.basi)
        ? pantone.basi.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'))
        : undefined;
      if (basePantone) {
        // Trova il materiale corrispondente tra i pantoneMateriali
        const materialeEsterno = pantoneMateriali.find((m) => m.nomeMateriale === basePantone.nomeMateriale && m.fornitore === basePantone.fornitore);
        if (materialeEsterno && materialeEsterno._id) {
          setPantoneEsternoSelezionato(materialeEsterno._id.toString());
          fd.pantoneEsternoInput = basePantone.quantita;
        }
      }
      setFormData(fd);
    }
  }, [pantone, pantoneMateriali]);

  const tipoSelezionato = typeof formData['tipo'] === 'string' ? formData['tipo'] : undefined;
  const { basi, loading, error } = useBasiMateriali(tipoSelezionato);

  const basiFiltrate =
    !loading && tipoSelezionato
      ? basi.filter(
          (base) => base.tipo === tipoSelezionato && base.stato === 'In uso' && Array.isArray(base.utilizzo) && base.utilizzo.includes('Base')
        )
      : [];

  const basiRaggruppatePerName = basiFiltrate.reduce<Record<string, BaseMateriale[]>>((acc, base) => {
    if (!acc[base.nomeMateriale]) acc[base.nomeMateriale] = [];
    acc[base.nomeMateriale].push(base);
    return acc;
  }, {});

  useEffect(() => {
    const requiredFields = [...pantoneFieldsLeft, ...pantoneFieldsCenter, ...pantoneNotes].filter((field) => field.required);
    const isValid = requiredFields.every((field) => {
      const value = formData[field.name];
      return value !== undefined && value !== '' && value !== null;
    });
    useModalStore.getState().setFormValid('duplicatePantone', isValid);
  }, [formData, basi]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(',', '.');
    setFormData((prev) => ({
      ...prev,
      [name]: cleanedValue,
    }));
  };

  const handlePantoneMaterialeSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = pantoneMateriali.find((m) => m._id?.toString() === selectedId);
    if (selected) {
      setPantoneEsternoSelezionato(selectedId);
      setFormData((prev) => {
        // Rimuovo eventuale duplicato di pantoneEsternoInput
        const rest = { ...prev };
        delete rest.pantoneEsternoInput;
        return {
          ...rest,
          nomePantone: selected.label,
          variante: selected.fornitore,
          tipo: selected.tipo,
          codiceFornitore: selected.codiceFornitore,
          pantoneEsternoInput: 2.5,
        };
      });
    } else {
      // Prima rimuovo pantoneEsternoInput, poi aggiorno la selezione
      setFormData((prev) => {
        if ('pantoneEsternoInput' in prev) {
          const rest = { ...prev };
          delete rest.pantoneEsternoInput;
          return rest;
        }
        return prev;
      });
      setPantoneEsternoSelezionato(null);
    }
  };

  useEffect(() => {
    // Somma tutte le quantità inserite nelle basi
    const doseBasi = Object.entries(formData)
      .filter(([key]) => key.startsWith('valore_'))
      .reduce((acc, [, value]) => acc + (Number(value) || 0), 0);
    // Se presente, aggiungi la quantità del pantone esterno SOLO se selezionato e presente l'input
    const dosePantoneEsterno =
      pantoneEsternoSelezionato && formData.pantoneEsternoInput !== undefined && formData.pantoneEsternoInput !== ''
        ? Number(formData.pantoneEsternoInput) || 0
        : 0;
    const doseTotale = doseBasi + dosePantoneEsterno;
    if (formData.dose !== doseTotale) {
      setFormData((prev) => ({ ...prev, dose: doseTotale }));
    }
  }, [formData, pantoneEsternoSelezionato]);

  // Costruzione delle basi finali
  const basiFinali = Object.entries(basiRaggruppatePerName)
    .map(([nomeBase, basiArr]) => {
      const fornitoreSelezionato = formData[`fornitore_${nomeBase}`];
      const valoreInserito = formData[`valore_${nomeBase}`];
      const baseSelezionata = basiArr.find((b) => b.fornitore === fornitoreSelezionato) || basiArr[0];
      return {
        nomeMateriale: baseSelezionata.nomeMateriale,
        label: baseSelezionata.label,
        quantita: Number(valoreInserito) || 0,
        codiceFornitore: String(baseSelezionata.codiceFornitore || ''),
        fornitore: String(baseSelezionata.fornitore || ''),
        tipo: String(baseSelezionata.tipo || ''),
        codiceColore: String(baseSelezionata.codiceColore || ''),
        utilizzo: ['Base'],
      };
    })
    .filter((b) => b.quantita > 0);

  // Se è selezionato un pantone esterno, aggiungi la base corrispondente
  if (pantoneEsternoSelezionato && formData.pantoneEsternoInput) {
    const pantoneEsterno = pantoneMateriali.find((m) => m._id?.toString() === pantoneEsternoSelezionato);
    if (pantoneEsterno) {
      basiFinali.push({
        nomeMateriale: pantoneEsterno.nomeMateriale,
        label: pantoneEsterno.label,
        quantita: Number(formData.pantoneEsternoInput) || 0,
        codiceFornitore: String(pantoneEsterno.codiceFornitore || ''),
        fornitore: String(pantoneEsterno.fornitore || ''),
        tipo: String(pantoneEsterno.tipo || ''),
        codiceColore: String(pantoneEsterno.codiceColore || ''),
        utilizzo: ['Pantone'],
      });
    }
  }

  const submit = useCallback(async () => {
    try {
      const nuovoPantone = {
        nomePantone: String(formData.nomePantone || ''),
        variante: String(formData.variante || ''),
        dataCreazione: new Date().toISOString(),
        ultimoUso: '',
        articolo: String(formData.articolo || ''),
        is: String(formData.is || ''),
        cliente: String(formData.cliente || ''),
        noteArticolo: String(formData.noteArticolo || ''),
        urgente: Boolean(formData.urgente) && formData.urgente !== 'false',
        tipoCarta: String(formData.tipoCarta || ''),
        fornitoreCarta: String(formData.fornitoreCarta || ''),
        passoCarta: Number(formData.passoCarta) || 0,
        hCarta: Number(formData.hCarta) || 0,
        stato: getEnumValue(formData.stato, ['In uso', 'Obsoleto', 'Da verificare'] as const, 'In uso'),
        tipo: getEnumValue(formData.tipo, ['EB', 'UV'] as const, 'EB'),
        descrizione: String(formData.descrizione || ''),
        noteColore: String(formData.noteColore || ''),
        consumo: Number(formData.consumo) || 0,
        dose: parseFloat(Number(formData.dose).toFixed(3)) || 0,
        daProdurre: Boolean(formData.daProdurre) && formData.daProdurre !== 'false',
        qtDaProdurre: Number(formData.qtDaProdurre) || 0,
        battuteDaProdurre: Number(formData.battuteDaProdurre) || 0,
        consegnatoProduzione: Boolean(formData.consegnatoProduzione) && formData.consegnatoProduzione !== 'false',
        qtConsegnataProduzione: Number(formData.qtConsegnataProduzione) || 0,
        pantoneGroupId: String(formData.pantoneGroupId || ''),
        basi: basiFinali,
        basiNormalizzate: '', // Se serve, aggiungi la logica
      };

      const validation = PantoneSchema.safeParse(nuovoPantone);
      if (!validation.success) {
        alert('Errore di validazione:\n' + validation.error.issues.map((e) => e.message).join('\n'));
        return false;
      }

      await createPantone(nuovoPantone);
      setErrorMessage(null);
      router.refresh();
      return true;
    } catch (error) {
      console.error('Errore durante il submit:', error);
      setErrorMessage('Errore durante il submit.');
      return false;
    }
  }, [router, formData, basiFinali, createPantone]);

  const reset = useCallback(() => {
    const iniziale: { [key: string]: string | number } = {};
    [...pantoneFieldsLeft, ...pantoneFieldsCenter, ...pantoneNotes, ...basi.map((b) => ({ name: b.nomeMateriale }))].forEach((field) => {
      iniziale[field.name] = ''; // resettiamo tutto a stringa vuota
    });
    setFormData(iniziale);
  }, [basi]);

  const submitRef = useRef(submit);
  const resetRef = useRef(reset);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);

  useEffect(() => {
    useModalStore.getState().registerHandler('duplicatePantone', {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, []);

  return (
    <form className="w-6xl">
      <div className="flex flex-row justify-between">
        <H3 className="mb-2">Dettagli Pantone</H3>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {/* Select Pantone Esterno */}
        <div className="mb-4 flex flex-row items-center border border-dashed border-[var(--border)] rounded-xl px-2">
          <label className="font-semibold mr-2">Importa pantone esterno:</label>
          <select
            className="p-2 rounded bg-zinc-700 text-white focus:outline-none"
            onChange={handlePantoneMaterialeSelect}
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
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-3 gap-2">
          <InputMap fields={pantoneFieldsLeft} formData={formData} handleChange={handleChange} />
          <InputMap fields={pantoneFieldsCenter} formData={formData} handleChange={handleChange} />
          <InputMap fields={pantoneNotes} formData={formData} handleChange={handleChange} />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold mt-5">Composizione</h2>
          {/* Pantone esterno input */}
          {pantoneEsternoSelezionato && (
            <div className="mb-4 flex flex-col">
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
      </div>
    </form>
  );
}
