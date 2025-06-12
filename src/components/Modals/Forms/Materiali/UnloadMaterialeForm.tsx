'use client';
import { materialeFieldsMovimentoUnload } from '@/constants/inputFields';
import { useUpdateMateriale } from '@/hooks/useMateriali';
import { useMaterialeFormValidation } from '@/hooks/MaterialeValidation/useMaterialeFormValidation';
import { MovimentoScaricoSchema } from '@/schemas/MaterialeSchema';
import { buildMaterialeFromFormData } from '@/lib/materiali/buildMaterialeFromFormData';
import { useModalStore } from '@/store/useModalStore';
import { Materiale } from '@/types/materialeTypes';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import MaterialeFormLayout from '@/components/Modals/Forms/MaterialeFormLayout';

type FormDataState = {
  [key: string]: string;
};

interface UnloadMaterialeFormProps {
  materiale: Materiale;
}

export default function UnloadMaterialeForm({ materiale: materialeProp }: UnloadMaterialeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>({});
  const { modalData, closeModal } = useModalStore();
  const materiale = materialeProp ?? (modalData as Materiale | undefined);
  const { updateMateriale } = useUpdateMateriale();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formDataRef = useRef<FormDataState>({});

  // Sincronizza il ref con lo stato formData per evitare problemi di valore non aggiornato
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Validazione centralizzata per campo
  const { fieldErrors, handleChangeWithValidation, validateMovimento } = useMaterialeFormValidation({
    formData,
    setFormData,
    schema: MovimentoScaricoSchema,
    buildMaterialeFromFormData: (fd) => buildMaterialeFromFormData(fd),
    isMovimento: true,
  });

  // Submit movimento scarico
  const submit = useCallback(async () => {
    setErrorMessage(null);
    if (!materiale || !materiale._id) return false;
    const currentFormData = formDataRef.current;
    const quantita = Number(currentFormData.quantita);
    // Validazione movimento tramite funzione dedicata
    const { validation, movimento } = validateMovimento(
      {
        quantita: quantita,
        noteOperatore: currentFormData.noteOperatore,
        tipo: 'scarico',
        causale: 'Scarico effettuato da operatore',
        data: new Date().toISOString(),
        DDT: currentFormData.DDT,
        dataDDT: currentFormData.dataDDT,
      },
      'scarico'
    );
    if (!validation.success) {
      setErrorMessage('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }
    const movimentoScarico = movimento as import('@/types/materialeTypes').MovimentoMateriale;
    const nuovaQuantita = Math.round((materiale.quantita - quantita) * 1000) / 1000;
    try {
      await updateMateriale(String(materiale._id), movimentoScarico, nuovaQuantita);
    } catch {
      setErrorMessage('Errore durante la richiesta al server per lo scarico materiale.');
      return false;
    }
    setErrorMessage(null);
    router.refresh();
    closeModal('unloadMateriale');
    return true;
  }, [materiale, updateMateriale, router, closeModal, validateMovimento]);

  const reset = useCallback(() => setFormData({}), []);

  const submitRef = useRef(submit);
  const resetRef = useRef(reset);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);

  useEffect(() => {
    // Usa la funzione direttamente dallo store per evitare referenze che cambiano
    useModalStore.getState().registerHandler('unloadMateriale', {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, []);

  if (!materiale) return <p>Materiale non selezionato o errore nel processo. Contattare lo sviluppatore!</p>;

  return (
    <>
      <p className="text-lg text-[var(--text)] mb-5">
        Quantità disponibile: <strong>{materiale.quantita}</strong> kg
      </p>
      <MaterialeFormLayout
        formData={formData}
        handleChange={handleChangeWithValidation}
        fieldList={materialeFieldsMovimentoUnload}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
      />
    </>
  );
}
