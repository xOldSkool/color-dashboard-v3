'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import PantoneFormLayout from '../PantoneFormLayout';
import { usePantoneForm } from '@/hooks/usePantoneForm';
import { useBasiMateriali, usePantoneMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { pantoneFieldsLeft, pantoneFieldsCenter, pantoneNotes } from '@/constants/inputFields';
import { useRouter } from 'next/navigation';
import { BaseMateriale } from '@/types/materialeTypes';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { useModalStore } from '@/store/useModalStore';
import { buildPantoneFromFormData } from '@/lib/pantoni/buildPantoneFromFormData';

export default function NewPantoneForm() {
  const router = useRouter();
  const { createPantone } = useCreatePantone();
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

  // Aggiorna automaticamente il campo dose come somma di tutte le quantità
  useEffect(() => {
    // Somma tutte le quantità inserite nelle basi
    const doseBasi = Object.entries(formData)
      .filter(([key]) => key.startsWith('valore_'))
      .reduce((acc, [, value]) => acc + (Number(value) || 0), 0);
    // Se presente, aggiungi la quantità del pantone esterno
    const dosePantoneEsterno =
      formData.pantoneEsternoInput !== undefined && formData.pantoneEsternoInput !== '' ? Number(formData.pantoneEsternoInput) || 0 : 0;
    const doseTotale = doseBasi + dosePantoneEsterno;
    if (Number(formData.dose) !== doseTotale) {
      const event = { target: { name: 'dose', value: doseTotale } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    }
  }, [formData, handleChange]);

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
