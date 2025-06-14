'use client';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import PantoneFormLayout from '../PantoneFormLayout';
import { usePantoneForm } from '@/hooks/PantoneValidation/usePantoneForm';
import { useBasiMateriali, usePantoneMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { useUpdateMagazzinoPantoni, useMagazzinoPantoni } from '@/hooks/useMagazzinoPantoni';
import { pantoneFieldsLeft, pantoneFieldsCenter, pantoneNotes } from '@/constants/inputFields';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { pantoneToFormData } from '@/lib/adapter';
import { useRouter } from 'next/navigation';
import { Pantone } from '@/types/pantoneTypes';
import { buildPantoneFromFormData } from '@/lib/pantoni/buildPantoneFromFormData';
import { usePantoneFormValidation } from '@/hooks/PantoneValidation/usePantoneFormValidation';
import { BaseMateriale } from '@/types/materialeTypes';
import { toast } from 'react-toastify';

interface DuplicatePantoneProps {
  pantone: Pantone;
}

export default function DuplicatePantoneForm({ pantone }: DuplicatePantoneProps) {
  const router = useRouter();
  const { createPantone } = useCreatePantone();
  const { pantoneMateriali, loading: loadingPantoniMateriali } = usePantoneMateriali();
  const { updateMagazzinoPantoni } = useUpdateMagazzinoPantoni();
  const { magazzinoPantone } = useMagazzinoPantoni({ pantoneGroupId: pantone.pantoneGroupId, tipo: pantone.tipo });
  const [pantoneEsternoSelezionato, setPantoneEsternoSelezionato] = useState<string | null>(null);

  // Precarica formData dal pantone originale e dalle note magazzino
  const initialData = useMemo(() => {
    const fd = pantoneToFormData(pantone);
    if (Array.isArray(pantone.basi)) {
      const basePantone = pantone.basi.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'));
      if (basePantone) {
        const materialeEsterno = pantoneMateriali.find((m) => m.nomeMateriale === basePantone.nomeMateriale && m.fornitore === basePantone.fornitore);
        if (materialeEsterno && materialeEsterno._id) {
          setPantoneEsternoSelezionato(materialeEsterno._id.toString());
          fd.pantoneEsternoInput = basePantone.quantita;
        }
      }
    }
    // Autocompleta noteColore e noteMagazzino dal magazzinoPantone
    if (magazzinoPantone) {
      fd.noteColore = magazzinoPantone.noteColore || '';
      fd.noteMagazzino = magazzinoPantone.noteMagazzino || '';
    }
    return fd;
  }, [pantone, pantoneMateriali, magazzinoPantone]);

  // Ref per tracciare i campi dinamici già aggiunti
  const addedBaseKeysRef = useRef<Set<string>>(new Set());

  // Ricava il tipo selezionato dal formData (prima di chiamare usePantoneForm)
  const tipoSelezionato = typeof initialData['tipo'] === 'string' && initialData['tipo'] !== '' ? initialData['tipo'] : undefined;
  // Carica le basi solo se il tipo è selezionato
  const { basi, loading, error } = useBasiMateriali(tipoSelezionato);

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

  // Custom submit logic per duplicazione
  const onSubmit = async (formData: Record<string, string | number | undefined>) => {
    const nuovoPantone = buildPantoneFromFormData({
      formData,
      basiRaggruppatePerName,
      pantoneEsternoSelezionato,
      pantoneMateriali,
    });
    const validation = PantoneSchema.safeParse(nuovoPantone);
    if (!validation.success) {
      alert('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }
    const noteColore = typeof formData['noteColore'] === 'string' ? formData['noteColore'] : '';
    const noteMagazzino = typeof formData['noteMagazzino'] === 'string' ? formData['noteMagazzino'] : '';
    const payload: Pantone & { noteColore?: string; noteMagazzino?: string } = { ...nuovoPantone, noteColore, noteMagazzino };
    await createPantone(payload);

    // Aggiorna note in magazzinoPantoni
    const pantoneGroupId = nuovoPantone.pantoneGroupId;
    const tipo = nuovoPantone.tipo;
    if (pantoneGroupId && tipo) {
      try {
        await updateMagazzinoPantoni({ pantoneGroupId, tipo, noteColore, noteMagazzino });
      } catch {
        toast.error('Errore aggiornamento note magazzino');
      }
    }
    router.refresh();
    return true;
  };

  const pantoneForm = usePantoneForm({
    initialData,
    onSubmit,
    validateFields,
    modalKey: 'duplicatePantone',
  });

  // Hook centralizzato per la validazione
  const { fieldErrors, handleChangeWithValidation: originalHandleChangeWithValidation } = usePantoneFormValidation<
    Record<string, string | number | undefined>,
    Pantone
  >({
    formData: pantoneForm.formData,
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
    pantoneForm.handleChange(e);
    originalHandleChangeWithValidation(e, customValue);
  };

  // Helper per chiamare handleChange con nome e valore senza ChangeEvent
  const setFormField = React.useCallback(
    (name: string, value: string | number) => {
      pantoneForm.handleChange({
        target: { name, value },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
      originalHandleChangeWithValidation({
        target: { name, value },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    },
    [pantoneForm, originalHandleChangeWithValidation]
  );

  // Effetto: sincronizza formData con i campi dinamici delle basi
  useEffect(() => {
    const nuoviCampi: Record<string, string | number> = {};
    Object.keys(basiRaggruppatePerName).forEach((nome) => {
      const fornitoreKey = `fornitore_${nome}`;
      const valoreKey = `valore_${nome}`;
      // Usa il valore già presente in initialData se esiste, altrimenti stringa vuota
      if (!addedBaseKeysRef.current.has(fornitoreKey)) {
        nuoviCampi[fornitoreKey] = pantoneForm.formData[fornitoreKey] ?? initialData[fornitoreKey] ?? '';
        addedBaseKeysRef.current.add(fornitoreKey);
      }
      if (!addedBaseKeysRef.current.has(valoreKey)) {
        nuoviCampi[valoreKey] = pantoneForm.formData[valoreKey] ?? initialData[valoreKey] ?? '';
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
  }, [basiRaggruppatePerName, setFormField, initialData, pantoneForm.formData]);

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
      Object.keys(pantoneForm.formData)
        .filter((k) => k.startsWith('valore_') || k === 'pantoneEsternoInput')
        .map((k) => `${k}:${pantoneForm.formData[k]}`)
        .join('|'),
    [pantoneForm.formData]
  );

  // Aggiorna automaticamente il campo dose come somma di tutte le quantità
  useEffect(() => {
    const doseBasi = Object.entries(pantoneForm.formData)
      .filter(([key]) => key.startsWith('valore_'))
      .reduce((acc, [, value]) => acc + (Number(value) || 0), 0);
    const dosePantoneEsterno =
      pantoneForm.formData.pantoneEsternoInput !== undefined && pantoneForm.formData.pantoneEsternoInput !== ''
        ? Number(pantoneForm.formData.pantoneEsternoInput) || 0
        : 0;
    const doseTotale = doseBasi + dosePantoneEsterno;
    if (Number(pantoneForm.formData.dose) !== doseTotale) {
      setFormField('dose', doseTotale);
    }
  }, [doseDeps, pantoneForm.formData.dose, pantoneForm.formData, setFormField]);

  // Aggiorna i campi noteColore e noteMagazzino solo la prima volta che arrivano dal magazzinoPantone
  const hasSetNoteColore = useRef(false);
  const hasSetNoteMagazzino = useRef(false);
  useEffect(() => {
    if (magazzinoPantone) {
      if (!hasSetNoteColore.current && magazzinoPantone.noteColore !== undefined) {
        pantoneForm.handleChange({
          target: { name: 'noteColore', value: magazzinoPantone.noteColore || '' },
        } as React.ChangeEvent<HTMLInputElement>);
        hasSetNoteColore.current = true;
      }
      if (!hasSetNoteMagazzino.current && magazzinoPantone.noteMagazzino !== undefined) {
        pantoneForm.handleChange({
          target: { name: 'noteMagazzino', value: magazzinoPantone.noteMagazzino || '' },
        } as React.ChangeEvent<HTMLInputElement>);
        hasSetNoteMagazzino.current = true;
      }
    }
  }, [magazzinoPantone, pantoneForm]);

  return (
    <PantoneFormLayout
      formData={pantoneForm.formData}
      handleChange={handleChangeWithValidation}
      errorMessage={pantoneForm.errorMessage}
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
