'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import PantoneFormLayout from '../PantoneFormLayout';
import { usePantoneForm } from '@/hooks/PantoneValidation/usePantoneForm';
import { useBasiMateriali, usePantoneMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { pantoneFieldsLeft, pantoneFieldsCenter, pantoneNotes } from '@/constants/inputFields';
import { useRouter } from 'next/navigation';
import { BaseMateriale } from '@/types/materialeTypes';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { useModalStore } from '@/store/useModalStore';
import { buildPantoneFromFormData } from '@/lib/pantoni/buildPantoneFromFormData';
import { Pantone } from '@/types/pantoneTypes';
import { usePantoneFormValidation } from '@/hooks/PantoneValidation/usePantoneFormValidation';

export default function NewPantoneForm() {
  const router = useRouter();
  const { createPantone } = useCreatePantone();
  const { pantoneMateriali, loading: loadingPantoniMateriali } = usePantoneMateriali();
  const [pantoneEsternoSelezionato, setPantoneEsternoSelezionato] = useState<string | null>(null);
  const closeModal = useModalStore((state) => state.closeModal);
  // Stato iniziale vuoto
  const initialData = {};
  // Ricava il tipo selezionato dal formData (prima di chiamare usePantoneForm)
  const [tipoSelezionato, setTipoSelezionato] = useState<string | undefined>(undefined);
  // Carica le basi solo se il tipo è selezionato
  const { basi, loading, error } = useBasiMateriali(tipoSelezionato);
  // Campi richiesti per la validazione
  const pantoneFields = [...pantoneFieldsLeft, ...pantoneFieldsCenter, ...pantoneNotes];
  const validateFields = pantoneFields.filter((f) => f.required).map((f) => f.name);
  // Stato per errori campo per campo

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

  // Custom submit logic for new Pantone
  const onSubmit = async (formData: Record<string, string | number | undefined>) => {
    const nuovoPantone = buildPantoneFromFormData({
      formData,
      basiRaggruppatePerName,
      pantoneEsternoSelezionato,
      pantoneMateriali,
    });
    // Validazione con Zod tramite hook
    const errors = validateAllFields();
    if (errors) {
      alert(
        'Errore di validazione:\n' +
          Object.entries(errors)
            .map(([k, v]) => `${k} - ${v}`)
            .join('\n')
      );
      return false;
    }
    setFieldErrors({}); // Nessun errore
    await createPantone(nuovoPantone);
    router.refresh();
    return true;
  };

  const { formData, handleChange, errorMessage, reset } = usePantoneForm({
    initialData,
    onSubmit,
    onSuccess: () => {
      closeModal('newPantone');
      reset();
    },
    onError: () => {},
    validateFields,
    modalKey: 'newPantone',
  });

  // Hook centralizzato per la validazione
  const {
    fieldErrors,
    setFieldErrors,
    handleChangeWithValidation: originalHandleChangeWithValidation,
    validateAllFields,
  } = usePantoneFormValidation<Record<string, string | number | undefined>, Pantone>({
    formData,
    schema: PantoneSchema as unknown as import('zod').ZodSchema<Pantone>,
    buildPantoneFromFormData: (args) =>
      buildPantoneFromFormData({
        formData: args.formData,
        basiRaggruppatePerName: args.basiRaggruppatePerName as Record<string, BaseMateriale[]>,
        pantoneEsternoSelezionato: args.pantoneEsternoSelezionato,
        pantoneMateriali: args.pantoneMateriali as BaseMateriale[],
      }),
    basiRaggruppatePerName: basiRaggruppatePerName as Record<string, unknown>,
    pantoneEsternoSelezionato,
    pantoneMateriali: pantoneMateriali as unknown[],
  });

  // Wrapper che aggiorna sia formData che errori
  const handleChangeWithValidation = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    customValue?: string | number
  ) => {
    handleChange(e); // aggiorna lo stato del form
    originalHandleChangeWithValidation(e, customValue); // aggiorna errori
  };

  // Ref per tracciare i campi dinamici già aggiunti
  const addedBaseKeysRef = useRef<Set<string>>(new Set());

  // Helper per chiamare handleChange con nome e valore senza ChangeEvent
  const setFormField = React.useCallback(
    (name: string, value: string | number) => {
      handleChange({
        target: { name, value },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    },
    [handleChange]
  );

  // Effetto: sincronizza formData con i campi dinamici delle basi
  useEffect(() => {
    const nuoviCampi: Record<string, string | number> = {};
    Object.keys(basiRaggruppatePerName).forEach((nome) => {
      const fornitoreKey = `fornitore_${nome}`;
      const valoreKey = `valore_${nome}`;
      if (!addedBaseKeysRef.current.has(fornitoreKey)) {
        nuoviCampi[fornitoreKey] = '';
        addedBaseKeysRef.current.add(fornitoreKey);
      }
      if (!addedBaseKeysRef.current.has(valoreKey)) {
        nuoviCampi[valoreKey] = '';
        addedBaseKeysRef.current.add(valoreKey);
      }
    });
    if (Object.keys(nuoviCampi).length > 0) {
      Object.entries(nuoviCampi).forEach(([key, value]) => {
        setFormField(key, value);
      });
    }
    // Pulizia: se cambiano le basi, rimuovi le chiavi non più presenti
    const allKeys = new Set<string>();
    Object.keys(basiRaggruppatePerName).forEach((nome) => {
      allKeys.add(`fornitore_${nome}`);
      allKeys.add(`valore_${nome}`);
    });
    addedBaseKeysRef.current.forEach((key) => {
      if (!allKeys.has(key)) {
        addedBaseKeysRef.current.delete(key);
      }
    });
  }, [basiRaggruppatePerName, setFormField]);

  // Autocompletamento campi quando si seleziona un pantone esterno
  const autoCompletedRef = useRef(false);
  useEffect(() => {
    if (!pantoneEsternoSelezionato || autoCompletedRef.current) return;
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
      Object.entries(autocompleted).forEach(([key, value]) => {
        setFormField(key, value ?? '');
      });
      autoCompletedRef.current = true;
    }
  }, [pantoneEsternoSelezionato, pantoneMateriali, setFormField]);

  // Dipendenza hash per dose effect
  const doseDeps = React.useMemo(
    () =>
      Object.keys(formData)
        .filter((k) => k.startsWith('valore_') || k === 'pantoneEsternoInput')
        .map((k) => `${k}:${formData[k]}`)
        .join('|'),
    [formData]
  );

  // Aggiorna automaticamente il campo dose come somma di tutte le quantità
  useEffect(() => {
    const doseBasi = Object.entries(formData)
      .filter(([key]) => key.startsWith('valore_'))
      .reduce((acc, [, value]) => acc + (Number(value) || 0), 0);
    const dosePantoneEsterno =
      formData.pantoneEsternoInput !== undefined && formData.pantoneEsternoInput !== '' ? Number(formData.pantoneEsternoInput) || 0 : 0;
    const doseTotale = doseBasi + dosePantoneEsterno;
    if (Number(formData.dose) !== doseTotale) {
      setFormField('dose', doseTotale);
    }
  }, [doseDeps, formData.dose, formData, setFormField]);

  // Aggiorna tipoSelezionato quando cambia il tipo nel form
  useEffect(() => {
    if (typeof formData['tipo'] === 'string' && formData['tipo'] !== '') {
      setTipoSelezionato(formData['tipo']);
    }
  }, [formData]);

  return (
    <PantoneFormLayout
      formData={formData}
      handleChange={handleChangeWithValidation}
      errorMessage={errorMessage}
      fieldErrors={fieldErrors}
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
