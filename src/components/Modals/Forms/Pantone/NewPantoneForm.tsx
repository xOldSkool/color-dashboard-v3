'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import PantoneFormLayout from './PantoneFormLayout';
import { usePantoneForm } from '@/hooks/usePantoneForm';
import { useBasiMateriali, usePantoneMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { pantoneFieldsLeft, pantoneFieldsCenter, pantoneNotes } from '@/constants/inputFields';
import { useRouter } from 'next/navigation';
import { Pantone } from '@/types/pantoneTypes';
import { BasiPantone } from '@/types/pantoneTypes';
import { BaseMateriale } from '@/types/materialeTypes';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { getEnumValue } from '@/utils/getEnumValues';
import { useModalStore } from '@/store/useModalStore';

// Funzione helper per costruire un oggetto Pantone dal formData
function buildPantoneFromFormData({
  formData,
  basiRaggruppatePerName,
  pantoneEsternoSelezionato,
  pantoneMateriali,
}: {
  formData: Record<string, string | number | undefined>;
  basiRaggruppatePerName: Record<string, BaseMateriale[]>;
  pantoneEsternoSelezionato: string | null;
  pantoneMateriali: BaseMateriale[];
}): Pantone {
  const basiFinali: BasiPantone[] = Object.entries(basiRaggruppatePerName)
    .map(([nomeBase, basiArr]) => {
      const fornitoreSelezionato = formData[`fornitore_${nomeBase}`];
      const valoreInserito = formData[`valore_${nomeBase}`];
      const baseSelezionata = basiArr.find((b: BaseMateriale) => b.fornitore === fornitoreSelezionato) || basiArr[0];
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
  // Pantone esterno
  if (pantoneEsternoSelezionato && formData.pantoneEsternoInput) {
    const pantoneEsterno = pantoneMateriali.find((m: BaseMateriale) => m._id?.toString() === pantoneEsternoSelezionato);
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
  return {
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
    dose: Number(formData.dose) || 0,
    daProdurre: Boolean(formData.daProdurre) && formData.daProdurre !== 'false',
    qtDaProdurre: Number(formData.qtDaProdurre) || 0,
    battuteDaProdurre: Number(formData.battuteDaProdurre) || 0,
    consegnatoProduzione: Boolean(formData.consegnatoProduzione) && formData.consegnatoProduzione !== 'false',
    qtConsegnataProduzione: Number(formData.qtConsegnataProduzione) || 0,
    pantoneGroupId: String(formData.pantoneGroupId || ''),
    basi: basiFinali,
    basiNormalizzate: '',
  };
}

export default function NewPantoneForm() {
  const router = useRouter();
  const { createPantone } = useCreatePantone();

  // Stato locale per formData (per sincronizzazione campi dinamici)
  const [localFormData, setLocalFormData] = useState<Record<string, string | number | undefined>>({});

  // Ricava il tipo selezionato dal localFormData (prima di chiamare usePantoneForm)
  const tipoSelezionato = typeof localFormData['tipo'] === 'string' && localFormData['tipo'] !== '' ? localFormData['tipo'] : undefined;
  // Carica le basi solo se il tipo è selezionato
  const { basi, loading, error } = useBasiMateriali(tipoSelezionato);
  const { pantoneMateriali, loading: loadingPantoniMateriali } = usePantoneMateriali();

  // Pantone esterno selezionato
  const [pantoneEsternoSelezionato, setPantoneEsternoSelezionato] = useState<string | null>(null);

  // Campi richiesti per la validazione
  const pantoneFields = [...pantoneFieldsLeft, ...pantoneFieldsCenter, ...pantoneNotes];
  const validateFields = pantoneFields.filter((f) => f.required).map((f) => f.name);

  // Raggruppamento basi per nome
  const basiFiltrate = useMemo(() => {
    return basi.filter((base) => base.stato === 'In uso' && Array.isArray(base.utilizzo) && base.utilizzo.includes('Base'));
  }, [basi]);
  const basiRaggruppatePerName = useMemo(() => {
    return basiFiltrate.reduce((acc: Record<string, BaseMateriale[]>, base) => {
      if (!acc[base.nomeMateriale]) acc[base.nomeMateriale] = [];
      acc[base.nomeMateriale].push(base);
      return acc;
    }, {});
  }, [basiFiltrate]);

  // Effetto: sincronizza formData con i campi dinamici delle basi
  const addedBaseKeysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    // Quando cambiano le basi, aggiungi i nuovi campi richiesti a localFormData SOLO se non già aggiunti
    const nuoviCampi: Record<string, string | number> = {};
    let changed = false;
    Object.keys(basiRaggruppatePerName).forEach((nome) => {
      const keyF = `fornitore_${nome}`;
      const keyV = `valore_${nome}`;
      if (!localFormData[keyF] && !addedBaseKeysRef.current.has(keyF)) {
        nuoviCampi[keyF] = '';
        addedBaseKeysRef.current.add(keyF);
        changed = true;
      }
      if (!localFormData[keyV] && !addedBaseKeysRef.current.has(keyV)) {
        nuoviCampi[keyV] = '';
        addedBaseKeysRef.current.add(keyV);
        changed = true;
      }
    });
    if (changed) {
      setLocalFormData((prev) => ({ ...prev, ...nuoviCampi }));
    }
  }, [basiRaggruppatePerName, localFormData]);

  const closeModal = useModalStore((state) => state.closeModal);

  // Custom submit logic for new Pantone
  const onSubmit = async (formData: Record<string, string | number | undefined>) => {
    const nuovoPantone = buildPantoneFromFormData({
      formData,
      basiRaggruppatePerName,
      pantoneEsternoSelezionato,
      pantoneMateriali,
    });
    // Validazione con Zod
    const validation = PantoneSchema.safeParse(nuovoPantone);
    if (!validation.success) {
      alert('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }
    await createPantone(nuovoPantone);
    router.refresh();
    return true;
  };

  // Submit centralizzato tramite usePantoneForm
  const { formData, handleChange, errorMessage, reset } = usePantoneForm({
    initialData: localFormData,
    onSubmit,
    onSuccess: () => {
      closeModal('newPantone');
      reset();
    },
    onError: () => {},
    validateFields,
    modalKey: 'newPantone',
  });

  // Sincronizza localFormData con formData di usePantoneForm
  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  // Autocompletamento campi quando si seleziona un pantone esterno
  // Questo effetto DEVE essere dopo la dichiarazione di handleChange!
  useEffect(() => {
    if (!pantoneEsternoSelezionato) return;
    const selected = pantoneMateriali.find((m) => m._id?.toString() === pantoneEsternoSelezionato);
    if (selected) {
      const autocompleted = {
        nomePantone: selected.label,
        variante: selected.fornitore,
        tipo: selected.tipo,
        dose: 2.5,
        codiceFornitore: selected.codiceFornitore,
        pantoneEsternoInput: 2.5,
      };
      setLocalFormData((prev) => ({ ...prev, ...autocompleted }));
      Object.entries(autocompleted).forEach(([key, value]) => {
        const event = { target: { name: key, value } } as React.ChangeEvent<HTMLInputElement>;
        handleChange(event);
      });
    }
  }, [pantoneEsternoSelezionato, pantoneMateriali, handleChange]);

  return (
    <PantoneFormLayout
      formData={formData}
      handleChange={handleChange}
      errorMessage={errorMessage}
      pantoneMateriali={pantoneMateriali}
      pantoneEsternoSelezionato={pantoneEsternoSelezionato}
      setPantoneEsternoSelezionato={setPantoneEsternoSelezionato}
      loadingPantoniMateriali={loadingPantoniMateriali}
      basiRaggruppatePerName={basiRaggruppatePerName}
      basi={basi}
      loading={loading}
      error={error}
    />
  );
}
