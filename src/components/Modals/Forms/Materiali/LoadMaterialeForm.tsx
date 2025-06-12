'use client';
import { materialeFieldsMovimentoLoad } from '@/constants/inputFields';
import { useUpdateMateriale } from '@/hooks/useMateriali';
import { MovimentoCaricoSchema } from '@/schemas/MaterialeSchema';
import { useModalStore } from '@/store/useModalStore';
import { Materiale } from '@/types/materialeTypes';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import MaterialeFormLayout from '@/components/Modals/Forms/MaterialeFormLayout';
import { useMaterialeFormValidation } from '@/hooks/MaterialeValidation/useMaterialeFormValidation';
import { buildMaterialeFromFormData } from '@/lib/materiali/buildMaterialeFromFormData';

// Tipi
type FormDataState = Record<string, string>;
interface LoadMaterialeFormProps {
  materiale: Materiale;
}

export default function LoadMaterialeForm({ materiale: materialeProp }: LoadMaterialeFormProps) {
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
    schema: MovimentoCaricoSchema,
    buildMaterialeFromFormData: (fd) => buildMaterialeFromFormData(fd),
    isMovimento: true,
  });

  // Submit movimento
  const submit = useCallback(async () => {
    setErrorMessage(null);
    if (!materiale || !materiale._id) return false;
    const currentFormData = formDataRef.current;
    const quantita = Number(currentFormData.quantita);
    if (isNaN(quantita) || quantita <= 0) {
      setErrorMessage('La quantità deve essere un numero valido maggiore di zero.');
      return false;
    }
    if (!currentFormData.DDT || !currentFormData.dataDDT) {
      setErrorMessage('DDT e Data DDT sono obbligatori.');
      return false;
    }
    // Validazione movimento tramite funzione dedicata
    const { validation, movimento } = validateMovimento(
      {
        quantita: quantita,
        DDT: currentFormData.DDT,
        dataDDT: currentFormData.dataDDT,
        noteOperatore: currentFormData.noteOperatore,
        causale: 'Arrivo fornitore',
        tipo: 'carico',
        data: new Date().toISOString(),
      },
      'carico'
    );
    if (!validation.success) {
      setErrorMessage('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }
    // Cast esplicito per evitare errori di tipo
    const movimentoCarico = movimento as import('@/types/materialeTypes').MovimentoMateriale;
    const nuovaQuantita = Math.round((materiale.quantita + quantita) * 1000) / 1000;
    try {
      await updateMateriale(String(materiale._id), movimentoCarico, nuovaQuantita);
    } catch {
      setErrorMessage('Errore durante la richiesta al server per il carico/scarico materiale.');
      return false;
    }
    setErrorMessage(null);
    router.refresh();
    closeModal('loadMateriale');
    return true;
  }, [materiale, updateMateriale, router, closeModal, validateMovimento]);

  // Reset form
  const reset = useCallback(() => setFormData({}), []);
  const submitRef = useRef(submit);
  const resetRef = useRef(reset);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);

  useEffect(() => {
    useModalStore.getState().registerHandler('loadMateriale', {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, []);

  if (!materiale) return <p>Materiale non selezionato o errore nel processo. Contattare lo sviluppatore!</p>;

  return (
    <MaterialeFormLayout
      formData={formData}
      handleChange={handleChangeWithValidation}
      fieldList={materialeFieldsMovimentoLoad}
      errorMessage={errorMessage}
      fieldErrors={fieldErrors}
    />
  );
}
