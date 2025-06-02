'use client';

import InputMap from '@/components/InputMap';
import Loader from '@/components/Loader';
import { pantoneFieldsCenter, pantoneFieldsLeft, pantoneNotes } from '@/constants/inputFields';
import { useBasiMateriali } from '@/hooks/useMateriali';
import { useUpdatePantone } from '@/hooks/usePantone';
import { pantoneToFormData } from '@/lib/adapter';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { useModalStore } from '@/store/useModalStore';
import { BaseMateriale } from '@/types/materialeTypes';
import { Pantone } from '@/types/pantoneTypes';
import { getEnumValue } from '@/utils/getEnumValues';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

interface EditFormProps {
  pantone: Pantone;
}

export default function EditPantoneForm({ pantone }: EditFormProps) {
  const router = useRouter();
  const { updatePantone } = useUpdatePantone();
  const [formData, setFormData] = useState<Record<string, string | number | undefined>>({});
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

  // Precaricamento formData con pantone originale
  useEffect(() => {
    if (pantone) {
      setFormData(pantoneToFormData(pantone));
    }
  }, [pantone]);

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
    if (formData.dose !== doseTotale) {
      setFormData((prev) => ({ ...prev, dose: doseTotale }));
    }
  }, [formData]);

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
      };
    })
    .filter((b) => b.quantita > 0);

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  console.log('basiFiltrate:', basiFiltrate);
  console.log('basiFinali:', basiFinali);

  const submit = useCallback(async () => {
    const formData = formDataRef.current;
    try {
      console.log('SUBMIT: formData prima del submit:', formData);
      if (!pantone._id) {
        setErrorMessage('ID Pantone mancante.');
        return false;
      }
      const aggiornato = {
        ...pantone,
        nomePantone: String(formData.nomePantone ?? pantone.nomePantone),
        variante: String(formData.variante ?? pantone.variante),
        articolo: String(formData.articolo ?? pantone.articolo),
        is: String(formData.is ?? pantone.is),
        cliente: String(formData.cliente ?? pantone.cliente),
        noteArticolo: String(formData.noteArticolo ?? pantone.noteArticolo),
        urgente: formData.urgente !== undefined ? String(formData.urgente) === 'true' : (pantone.urgente ?? false),
        tipoCarta: String(formData.tipoCarta ?? pantone.tipoCarta),
        fornitoreCarta: String(formData.fornitoreCarta ?? pantone.fornitoreCarta),
        passoCarta: Number(formData.passoCarta ?? pantone.passoCarta) || 0,
        hCarta: Number(formData.hCarta ?? pantone.hCarta) || 0,
        stato: getEnumValue(formData.stato, ['In uso', 'Obsoleto', 'Da verificare'] as const, 'In uso') ?? pantone.stato,
        tipo: getEnumValue(formData.tipo, ['EB', 'UV'] as const, 'EB') ?? pantone.tipo,
        descrizione: String(formData.descrizione ?? pantone.descrizione),
        noteColore: String(formData.noteColore ?? pantone.noteColore),
        consumo: Number(formData.consumo ?? pantone.consumo) || 0,
        dose: parseFloat(Number(formData.dose ?? pantone.dose).toFixed(3)) || 0,
        daProdurre: formData.daProdurre !== undefined ? String(formData.daProdurre) === 'true' : (pantone.daProdurre ?? false),
        qtDaProdurre: Number(formData.qtDaProdurre ?? pantone.qtDaProdurre) || 0,
        battuteDaProdurre: Number(formData.battuteDaProdurre ?? pantone.battuteDaProdurre) || 0,
        consegnatoProduzione:
          formData.consegnatoProduzione !== undefined ? String(formData.consegnatoProduzione) === 'true' : (pantone.consegnatoProduzione ?? false),
        qtConsegnataProduzione: Number(formData.qtConsegnataProduzione ?? pantone.qtConsegnataProduzione) || 0,
        pantoneGroupId: String(formData.pantoneGroupId ?? pantone.pantoneGroupId),
        basi: basiFinali,
        basiNormalizzate: pantone.basiNormalizzate ?? '',
      };
      console.log('Invio aggiornato:', aggiornato);

      const validation = PantoneSchema.safeParse(aggiornato);
      if (!validation.success) {
        alert('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
        return false;
      }

      await updatePantone(pantone._id.toString(), aggiornato);
      setErrorMessage(null);
      router.refresh();
      return true;
    } catch (err) {
      console.error('Errore durante il submit', err);
      setErrorMessage('Errore durante il submit.');
      return false;
    }
  }, [router, pantone, basiFinali, updatePantone]);

  const reset = useCallback(() => {
    setFormData({});
  }, []);

  const submitRef = useRef(submit);
  const resetRef = useRef(reset);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);

  useEffect(() => {
    useModalStore.getState().registerHandler('editPantone', {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, []);

  return (
    <form className="w-6xl">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="grid grid-cols-1 gap-4">
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
                {Object.entries(basiRaggruppatePerName).map(([nomeMateriale, basi]) => {
                  const fornitoriDisponibili = basi.map((b) => ({
                    id: b._id!.toString(),
                    label: b.label,
                    fornitore: b.fornitore,
                    codiceColore: b.codiceColore,
                  }));
                  const label = basi[0].label || nomeMateriale;

                  return (
                    <div key={nomeMateriale}>
                      <label>
                        {label}
                        <span className="text-sm">
                          {fornitoriDisponibili.length > 1 ? (
                            <select
                              name={`fornitore_${nomeMateriale}`}
                              className="ml-2 rounded bg-zinc-800 text-white italic focus:outline-none"
                              onChange={handleChange}
                              value={formData[`fornitore_${nomeMateriale}`] || ''}
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
                        name={`valore_${nomeMateriale}`}
                        type="number"
                        placeholder="0"
                        className="w-full p-2 rounded bg-zinc-600 text-white focus:outline-none mt-1"
                        value={formData[`valore_${nomeMateriale}`] || ''}
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
