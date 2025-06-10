import React, { useMemo, useState, useRef, useEffect } from 'react';
import PantoneFormLayout from '../PantoneFormLayout';
import { usePantoneForm } from '@/hooks/usePantoneForm';
import { useBasiMateriali, usePantoneMateriali } from '@/hooks/useMateriali';
import { useUpdatePantone } from '@/hooks/usePantone';
import { pantoneFieldsLeft, pantoneFieldsCenter, pantoneNotes } from '@/constants/inputFields';
import { PantoneSchema } from '@/schemas/PantoneSchema';
import { pantoneToFormData } from '@/lib/adapter';
import { useRouter } from 'next/navigation';
import { Pantone } from '@/types/pantoneTypes';
import { buildPantoneFromFormData } from '@/lib/pantoni/buildPantoneFromFormData';

interface EditFormProps {
  pantone: Pantone;
}

export default function EditPantoneForm({ pantone }: EditFormProps) {
  const router = useRouter();
  const { updatePantone } = useUpdatePantone();
  const [pantoneEsternoSelezionato, setPantoneEsternoSelezionato] = useState<string | null>(null);
  const { pantoneMateriali, loading: loadingPantoniMateriali } = usePantoneMateriali();

  // Precarica formData dal pantone originale
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

  // Custom submit logic per modifica
  const onSubmit = async (formData: Record<string, string | number | undefined>) => {
    const aggiornato = buildPantoneFromFormData({
      formData,
      basiRaggruppatePerName,
      pantoneEsternoSelezionato,
      pantoneMateriali,
    });
    // Validazione con Zod
    const validation = PantoneSchema.safeParse(aggiornato);
    if (!validation.success) {
      alert('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }
    if (!pantone._id) return false;
    await updatePantone(pantone._id.toString(), aggiornato);
    router.refresh();
    return true;
  };

  const pantoneForm = usePantoneForm({
    initialData: localFormData,
    onSubmit,
    validateFields,
    modalKey: 'editPantone',
  });

  // Sincronizza localFormData con formData di usePantoneForm
  useEffect(() => {
    setLocalFormData(pantoneForm.formData);
  }, [pantoneForm.formData]);

  // Autocompletamento campi quando si seleziona un pantone esterno
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
      const event = { target: { name: 'dose', value: doseTotale } } as unknown as React.ChangeEvent<HTMLInputElement>;
      pantoneForm.handleChange(event);
    }
  }, [pantoneForm, pantoneForm.formData, pantoneForm.handleChange]);

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
