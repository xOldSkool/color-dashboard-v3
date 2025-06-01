'use client';
import InputMap from '@/components/InputMap';
import Loader from '@/components/Loader';
import { pantoneFieldsCenter, pantoneFieldsLeft, pantoneNotes } from '@/constants/inputFields';
import { useBasiMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { useModalStore } from '@/store/useModalStore';
import { BaseMateriale } from '@/types/materialeTypes';
import { getEnumValue } from '@/utils/getEnumValues';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';

export interface FormData {
  [key: string]: string | number | undefined;
}

export default function NewPantoneForm() {
  const router = useRouter();
  const { createPantone } = useCreatePantone();
  const [formData, setFormData] = useState<FormData>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tipoSelezionato = typeof formData['tipo'] === 'string' ? formData['tipo'] : undefined;
  const { basi, loading, error } = useBasiMateriali(tipoSelezionato);

  const basiFiltrate =
    !loading && tipoSelezionato ? basi.filter((base) => base.tipo === tipoSelezionato && base.stato === 'In uso' && base.utilizzo === 'Base') : [];

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
    useModalStore.getState().setFormValid('newPantone', isValid);
  }, [formData, basi]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(',', '.');
    setFormData((prev) => ({
      ...prev,
      [name]: cleanedValue,
    }));
  };

  useEffect(() => {
    // Somma tutte le quantità inserite nelle basi
    const doseTotale = Object.entries(formData)
      .filter(([key]) => key.startsWith('valore_'))
      .reduce((acc, [, value]) => acc + (Number(value) || 0), 0);
    // Aggiorna il campo dose solo se è diverso
    if (formData.dose !== doseTotale) {
      setFormData((prev) => ({ ...prev, dose: doseTotale }));
    }
  }, [formData]);

  const pantone: Record<string, string | number | undefined> = {};
  for (const [key, value] of Object.entries(formData)) {
    if (!key.startsWith('fornitore_') && !key.startsWith('valore_')) {
      pantone[key] = value;
    }
  }

  const basiFinali = Object.entries(basiRaggruppatePerName)
    .map(([nomeBase, basiArr]) => {
      // Recupero il fornitore selezionato per questa base
      const fornitoreSelezionato = formData[`fornitore_${nomeBase}`];
      // Recupero la quantità inserita per questa base
      const valoreInserito = formData[`valore_${nomeBase}`];
      // Trovo il documento della base corrispondente al fornitore selezionato
      const baseSelezionata = basiArr.find((b) => b.fornitore === fornitoreSelezionato) || basiArr[0];
      return {
        nomeMateriale: baseSelezionata.nomeMateriale,
        label: baseSelezionata.label,
        quantita: Number(valoreInserito) || 0, // sempre number
        codiceFornitore: String(baseSelezionata.codiceFornitore || ''),
        fornitore: String(baseSelezionata.fornitore || ''),
        tipo: String(baseSelezionata.tipo || ''),
        codiceColore: String(baseSelezionata.codiceColore || ''),
      };
    })
    .filter((b) => b.quantita > 0);

  const submit = useCallback(async () => {
    try {
      // Costruisci l'oggetto Pantone rispettando il tipo richiesto
      const nuovoPantone = {
        nomePantone: String(formData.nomePantone || ''),
        variante: String(formData.variante || ''),
        dataCreazione: new Date().toISOString(),
        ultimoUso: String(''),
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
        dose: Number(formData.dose) || 0,
        daProdurre: Boolean(formData.daProdurre) && formData.daProdurre !== 'false',
        qtDaProdurre: Number(formData.qtDaProdurre) || 0,
        battuteDaProdurre: Number(formData.battuteDaProdurre) || 0,
        consegnatoProduzione: Boolean(formData.consegnatoProduzione) && formData.consegnatoProduzione !== 'false',
        qtConsegnataProduzione: Number(formData.qtConsegnataProduzione) || 0,
        pantoneGroupId: String(formData.pantoneGroupId || ''),
        basi: basiFinali,
        basiNormalizzate: String(''), // Se serve, aggiungi la logica
      };

      // Validazione con Zod
      const validation = PantoneSchema.safeParse(nuovoPantone);
      if (!validation.success) {
        // Mostra errore (puoi usare un toast, alert, setState, ecc.)
        alert('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
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
  }, [formData, basiFinali, createPantone]);

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
    useModalStore.getState().registerHandler('newPantone', {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, []);

  return (
    <form className="w-6xl">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="grid grid-cols-1 gap-2">
        <div className="grid grid-cols-3 gap-2">
          <InputMap fields={pantoneFieldsLeft} formData={formData} handleChange={handleChange} />
          <InputMap fields={pantoneFieldsCenter} formData={formData} handleChange={handleChange} />
          <InputMap fields={pantoneNotes} formData={formData} handleChange={handleChange} />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold mt-5">Composizione</h2>

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
