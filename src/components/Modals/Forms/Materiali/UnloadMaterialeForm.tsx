'use client';
import { materialeFieldsMovimentoUnload } from '@/constants/inputFields';
import { useUpdateMateriale } from '@/hooks/useMateriali';
import { useModalStore } from '@/store/useModalStore';
import { Materiale } from '@/types/materialeTypes';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      formDataRef.current = updated;
      return updated;
    });
  };

  // Submit movimento scarico
  const submit = useCallback(async () => {
    setErrorMessage(null);
    if (!materiale || !materiale._id) return false;
    const currentFormData = formDataRef.current;
    const movimento = {
      ...currentFormData,
      quantita: Math.round(Number(currentFormData.quantita) * 1000) / 1000,
      data: new Date().toISOString(),
      tipo: 'scarico',
      noteOperatore: currentFormData.noteOperatore,
      causale: currentFormData.noteOperatore,
      DDT: '',
      dataDDT: '',
      fromUnload: true,
    };
    // Validazione solo sul movimento corrente
    const { MovimentoSchema } = await import('@/schemas/MaterialeSchema');
    const movimentoValidation = MovimentoSchema.safeParse(movimento);
    if (!movimentoValidation.success) {
      setErrorMessage('Errore di validazione:\n' + movimentoValidation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }
    const nuovaQuantita = Math.round((materiale.quantita - movimento.quantita) * 1000) / 1000;
    try {
      await updateMateriale(String(materiale._id), movimento, nuovaQuantita);
    } catch {
      setErrorMessage('Errore durante la richiesta al server per lo scarico materiale.');
      return false;
    }
    setErrorMessage(null);
    router.refresh();
    closeModal('unloadMateriale');
    return true;
  }, [materiale, updateMateriale, router, closeModal]);

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
    <MaterialeFormLayout
      title="Scarico materiale"
      formData={formData}
      handleChange={handleChange}
      fieldList={materialeFieldsMovimentoUnload}
      errorMessage={errorMessage}
    >
      <p className="text-sm text-gray-500">
        Quantità attuale: <strong>{materiale.quantita}</strong> kg
      </p>
    </MaterialeFormLayout>
  );
}
