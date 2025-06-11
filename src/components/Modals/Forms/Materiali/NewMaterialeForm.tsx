'use client';
import { materialeFieldsCreate } from '@/constants/inputFields';
import { useCreateMateriale } from '@/hooks/useMateriali';
import { MaterialeSchema, MovimentoSchema } from '@/schemas/MaterialeSchema';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import React from 'react';
import MaterialeFormLayout from '@/components/Modals/Forms/MaterialeFormLayout';
import { buildMaterialeFromFormData } from '@/lib/materiali/buildMaterialeFromFormData';
import { useMaterileForm } from '@/hooks/MaterialeValidation/useMaterialeForm';
import { useMaterialeFormValidation } from '@/hooks/MaterialeValidation/useMaterialeFormValidation';
import toCamelCase from '@/utils/toCamelCase';

export default function NewMaterialeForm() {
  const router = useRouter();
  const { createMateriale } = useCreateMateriale();

  // Inizializzazione form con custom hook
  const materialeForm = useMaterileForm({
    initialData: {},
    onSubmit: handleSubmit,
    modalKey: 'newMateriale',
  });

  // Validazione centralizzata
  const { fieldErrors, handleChangeWithValidation, validateAllFields } = useMaterialeFormValidation({
    formData: materialeForm.formData,
    setFormData: materialeForm.setFormData,
    schema: MaterialeSchema,
    buildMaterialeFromFormData: (fd) => buildMaterialeFromFormData(fd),
  });

  async function handleSubmit(formData: Record<string, string | number | string[] | undefined>) {
    // Forza coerenza: aggiorna sempre 'nomeMateriale' da 'label' (camelCase)
    const label = typeof formData.label === 'string' ? formData.label : '';
    const nomeMateriale = toCamelCase(label);
    const formDataWithNomeMateriale = {
      ...formData,
      nomeMateriale,
    };
    // Costruzione oggetto materiale tramite funzione centralizzata
    const nuovoMateriale = buildMaterialeFromFormData(formDataWithNomeMateriale);
    // Validazione globale
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
    // Validazione movimenti (se presente)
    if (nuovoMateriale.movimenti && nuovoMateriale.movimenti.length > 0) {
      const movimento = nuovoMateriale.movimenti[0];
      const movimentoValidation = MovimentoSchema.safeParse(movimento);
      if (!movimentoValidation.success) {
        alert('Errore di validazione movimento:\n' + movimentoValidation.error.issues.map((e: z.ZodIssue) => e.message).join('\n'));
        return false;
      }
    }
    await createMateriale(nuovoMateriale);
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
