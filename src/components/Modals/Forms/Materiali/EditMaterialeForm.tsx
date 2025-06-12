'use client';
import React from 'react';
import MaterialeFormLayout from '@/components/Modals/Forms/MaterialeFormLayout';
import { materialeFieldsCreate } from '@/constants/inputFields';
import { useUpdateMaterialeCompleto } from '@/hooks/useMateriali';
import { MaterialeSchema } from '@/schemas/MaterialeSchema';
import { Materiale } from '@/types/materialeTypes';
import { useRouter } from 'next/navigation';
import { useMaterialeForm } from '@/hooks/MaterialeValidation/useMaterialeForm';
import { useMaterialeFormValidation } from '@/hooks/MaterialeValidation/useMaterialeFormValidation';
import { normalizzaMovimenti } from '@/lib/materiali/normalizzaMovimenti';
import { materialeToFormData } from '@/lib/adapter';
import { buildMaterialeFromFormData } from '@/lib/materiali/buildMaterialeFromFormData';
import toCamelCase from '@/utils/toCamelCase';

interface EditMaterialeFormProps {
  materiale: Materiale;
}

export default function EditMaterialeForm({ materiale }: EditMaterialeFormProps) {
  const router = useRouter();
  const { updateMaterialeCompleto } = useUpdateMaterialeCompleto();

  // Inizializza il form con i dati del materiale
  const initialData = (() => {
    const base = materialeToFormData(materiale);
    const label = typeof base.label === 'string' ? base.label : '';
    const nomeMateriale =
      base.nomeMateriale && typeof base.nomeMateriale === 'string' && base.nomeMateriale.length > 0 ? base.nomeMateriale : toCamelCase(label);
    // Normalizza utilizzo come array di stringhe
    const utilizzo = Array.isArray(base.utilizzo)
      ? base.utilizzo
      : typeof base.utilizzo === 'string' && base.utilizzo
        ? base.utilizzo
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [];
    return { ...base, nomeMateriale, utilizzo };
  })();
  const materialeForm = useMaterialeForm({
    initialData,
    onSubmit: handleSubmit,
    modalKey: 'editMateriale',
  });

  // Validazione centralizzata
  const { fieldErrors, handleChangeWithValidation, validateAllFields } = useMaterialeFormValidation({
    formData: materialeForm.formData,
    setFormData: materialeForm.setFormData,
    schema: MaterialeSchema,
    buildMaterialeFromFormData: (fd) => buildMaterialeFromFormData(fd),
  });

  async function handleSubmit(formData: Record<string, string | number | string[] | undefined>) {
    if (!materiale._id) {
      materialeForm.setErrorMessage('ID materiale mancante.');
      return false;
    }
    // Forza coerenza: aggiorna sempre 'nomeMateriale' da 'label' (camelCase)
    const label = typeof formData.label === 'string' ? formData.label : '';
    const nomeMateriale = toCamelCase(label);
    const formDataWithNomeMateriale = { ...formData, nomeMateriale };
    // Costruzione oggetto materiale aggiornato tramite funzione centralizzata
    const materialeAggiornato = buildMaterialeFromFormData(formDataWithNomeMateriale);
    // Mantieni i valori obbligatori che non devono cambiare
    materialeAggiornato.quantita = materiale.quantita;
    materialeAggiornato.dataCreazione = materiale.dataCreazione;
    // Validazione globale
    const errors = validateAllFields();
    if (errors) {
      materialeForm.setErrorMessage(
        'Errore di validazione:\n' +
          Object.entries(errors)
            .map(([k, v]) => `${k} - ${v}`)
            .join('\n')
      );
      return false;
    }
    await updateMaterialeCompleto(materiale._id.toString(), {
      ...materialeAggiornato,
      movimenti: normalizzaMovimenti(materialeAggiornato.movimenti),
    });
    materialeForm.setErrorMessage(null);
    router.refresh();
    return true;
  }

  return (
    <>
      <MaterialeFormLayout
        formData={materialeForm.formData}
        handleChange={handleChangeWithValidation}
        fieldList={materialeFieldsCreate}
        errorMessage={materialeForm.errorMessage}
        fieldErrors={fieldErrors}
      />
    </>
  );
}
