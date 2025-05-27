'use client';
import InputMap from '@/components/InputMap';
import Loader from '@/components/Loader';
import { pantoneFieldsCenter, pantoneFieldsLeft, pantoneNotes } from '@/constants/inputFields';
import { useBasiMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { useModalStore } from '@/store/useModalStore';
import { BaseMateriale } from '@/types/materialeTypes';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';

interface FormData {
  [key: string]: string | number | undefined;
}

export default function NewForm() {
  const { basi, loading, error } = useBasiMateriali();
  const { create } = useCreatePantone();
  const [formData, setFormData] = useState<FormData>({});

  //   const isFormEmpty = () => Object.values(formData).every((value) => value === '');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const cleanedValue = value.replace(',', '.');
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' && cleanedValue !== '' ? parseFloat(cleanedValue) : cleanedValue,
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

  const tipoSelezionato = formData['tipo'];
  const basiFiltrate = tipoSelezionato
    ? basi.filter((base) => base.tipo === tipoSelezionato && base.stato === 'In uso' && base.utilizzo === 'Base')
    : [];
  const basiRaggruppatePerName = basiFiltrate.reduce<Record<string, BaseMateriale[]>>((acc, base) => {
    if (!acc[base.name]) acc[base.name] = [];
    acc[base.name].push(base);
    return acc;
  }, {});

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
        name: baseSelezionata.name,
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
        _id: '', // Sarà generato dal backend
        nomePantone: String(formData.nomePantone || ''),
        variante: String(formData.variante || ''),
        dataCreazione: new Date().toISOString(),
        articolo: String(formData.articolo || ''),
        is: String(formData.is || ''),
        cliente: String(formData.cliente || ''),
        noteArticolo: String(formData.noteArticolo || ''),
        urgente: Boolean(formData.urgente) && formData.urgente !== 'false',
        tipoCarta: String(formData.tipoCarta || ''),
        fornitoreCarta: String(formData.fornitoreCarta || ''),
        passoCarta: Number(formData.passoCarta) || 0,
        hCarta: Number(formData.hCarta) || 0,
        hex: String(formData.hex || ''),
        stato: String(formData.stato || ''),
        tipo: String(formData.tipo || ''),
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
        basiNormalizzate: '', // Se serve, aggiungi la logica
      };

      await create(nuovoPantone);
      // Puoi aggiungere qui una notifica o un reset del form
    } catch (error) {
      console.error('Errore durante il submit:', error);
    }
  }, [formData, basiFinali, create]);

  const reset = useCallback(() => {
    const iniziale: { [key: string]: string | number } = {};
    [...pantoneFieldsLeft, ...pantoneFieldsCenter, ...pantoneNotes, ...basi.map((b) => ({ name: b.name }))].forEach((field) => {
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

  if (loading) return <Loader />;
  if (error) return <p>{error}</p>;

  return (
    <form>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-3 gap-2">
          <InputMap fields={pantoneFieldsLeft} formData={formData} handleChange={handleChange} />
          <InputMap fields={pantoneFieldsCenter} formData={formData} handleChange={handleChange} />
          <InputMap fields={pantoneNotes} formData={formData} handleChange={handleChange} />
        </div>
        <div className="flex flex-row items-center gap-5">
          <h2 className="text-2xl font-semibold mt-5">Composizione</h2>
          {Object.entries(basiRaggruppatePerName).map(([nome, basi]) => {
            const fornitoriDisponibili = basi.map((b) => ({
              id: b._id.toString(),
              label: b.label,
              fornitore: b.fornitore,
              codiceColore: b.codiceColore,
            }));
            const label = basi[0].label || nome;

            return (
              <div key={nome} className="mb-4">
                <label className="block font-semibold text-white">
                  {label}
                  {fornitoriDisponibili.length > 1 ? (
                    // Select per più fornitori
                    <select
                      name={`fornitore_${nome}`}
                      className="ml-2 p-1 rounded bg-zinc-600 text-white"
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
                    // Mostra fornitore + codiceColore
                    <span className="ml-2 text-sm text-white">
                      {fornitoriDisponibili[0].fornitore} - {fornitoriDisponibili[0].codiceColore}
                    </span>
                  )}
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
      </div>
    </form>
  );
}
