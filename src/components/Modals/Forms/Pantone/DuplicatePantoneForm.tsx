'use client';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import PantoneFormLayout from './PantoneFormLayout';
import { usePantoneForm } from '@/hooks/usePantoneForm';
import { useBasiMateriali, usePantoneMateriali } from '@/hooks/useMateriali';
import { useCreatePantone } from '@/hooks/usePantone';
import { pantoneFieldsLeft, pantoneFieldsCenter, pantoneNotes } from '@/constants/inputFields';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { getEnumValue } from '@/utils/getEnumValues';
import { pantoneToFormData } from '@/lib/adapter';
import { useRouter } from 'next/navigation';
import { Pantone } from '@/types/pantoneTypes';

interface DuplicatePantoneProps {
  pantone: Pantone;
}

export default function DuplicatePantoneForm({ pantone }: DuplicatePantoneProps) {
  const router = useRouter();
  const { createPantone } = useCreatePantone();
  const { pantoneMateriali, loading: loadingPantoniMateriali } = usePantoneMateriali();
  const [pantoneEsternoSelezionato, setPantoneEsternoSelezionato] = useState<string | null>(null);

  // Precarica formData dal pantone originale
  const initialData = useMemo(() => {
    const fd = pantoneToFormData(pantone);
    // Se esiste una base Pantone, preimposta pantoneEsternoSelezionato
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
    return fd;
  }, [pantone, pantoneMateriali]);

  // Stato locale per formData (per sincronizzazione campi dinamici)
  const [localFormData, setLocalFormData] = useState<Record<string, string | number | undefined>>(initialData);
  // Ref per tracciare i campi dinamici già aggiunti
  const addedBaseKeysRef = useRef<Set<string>>(new Set());

  // Ricava il tipo selezionato dal localFormData (prima di chiamare usePantoneForm)
  const tipoSelezionato = typeof localFormData['tipo'] === 'string' && localFormData['tipo'] !== '' ? localFormData['tipo'] : undefined;
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
    return basiFiltrate.reduce((acc: Record<string, typeof basi>, base) => {
      if (!acc[base.nomeMateriale]) acc[base.nomeMateriale] = [];
      acc[base.nomeMateriale].push(base);
      return acc;
    }, {});
  }, [basiFiltrate]);

  // Effetto: sincronizza formData con i campi dinamici delle basi
  React.useEffect(() => {
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
      setLocalFormData((prev) => ({ ...prev, ...nuoviCampi }));
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
  }, [basiRaggruppatePerName]);

  // Custom submit logic per duplicazione
  const onSubmit = async (formData: Record<string, string | number | undefined>) => {
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
      basiNormalizzate: String(''),
      utilizzo: [],
    };
    const validation = PantoneSchema.safeParse(nuovoPantone);
    if (!validation.success) {
      alert('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }
    await createPantone(nuovoPantone);
    router.refresh();
    return true;
  };

  const pantoneForm = usePantoneForm({
    initialData: localFormData,
    onSubmit,
    validateFields,
    modalKey: 'duplicatePantone',
  });

  // Sincronizza localFormData con formData di usePantoneForm
  React.useEffect(() => {
    setLocalFormData(pantoneForm.formData);
  }, [pantoneForm.formData]);

  // Autocompletamento campi quando si seleziona un pantone esterno
  // Questo effetto DEVE essere dopo la dichiarazione di pantoneForm!
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
        pantoneForm.handleChange(event);
      });
    }
  }, [pantoneEsternoSelezionato, pantoneMateriali, pantoneForm, pantoneForm.handleChange]);

  return (
    <PantoneFormLayout
      formData={pantoneForm.formData}
      handleChange={pantoneForm.handleChange}
      errorMessage={pantoneForm.errorMessage}
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
