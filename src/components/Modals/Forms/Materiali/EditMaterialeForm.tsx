'use client';
import React from 'react';
import MaterialeFormLayout from '@/components/Modals/Forms/MaterialeFormLayout';
import { materialeFieldsCreate } from '@/constants/inputFields';
import { useUpdateMaterialeCompleto } from '@/hooks/useMateriali';
import { MaterialeSchema } from '@/schemas/MaterialeSchema';
import { useModalStore } from '@/store/useModalStore';
import { Materiale } from '@/types/materialeTypes';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState, useCallback } from 'react';
import { materialeToFormData } from '@/lib/adapter';
import toCamelCase from '@/utils/toCamelCase';
import { buildMaterialeFromFormData } from '@/lib/materiali/buildMaterialeFromFormData';

interface EditMaterialeFormProps {
  materiale: Materiale;
}

export default function EditMaterialeForm({ materiale }: EditMaterialeFormProps) {
  const router = useRouter();
  const { updateMaterialeCompleto } = useUpdateMaterialeCompleto();
  const [formData, setFormData] = useState<{ [key: string]: string | number | string[] | undefined }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Precaricamento formData con materiale originale
  useEffect(() => {
    if (materiale) {
      setFormData(materialeToFormData(materiale));
    }
  }, [materiale]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const cleanedValue = value.replace(',', '.');
    // Gestione checkbox multipli (array)
    if (type === 'checkbox' && name === 'utilizzo' && e.target instanceof HTMLInputElement) {
      const checked = e.target.checked;
      setFormData((prev) => {
        const prevArr = Array.isArray(prev.utilizzo) ? (prev.utilizzo as string[]) : [];
        let newArr: string[];
        if (checked) {
          // Evita duplicati e aggiungi solo se non già presente
          newArr = prevArr.includes(value) ? prevArr : [...prevArr, value];
        } else {
          newArr = prevArr.filter((v) => v !== value);
        }
        return { ...prev, [name]: newArr };
      });
      return;
    }
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'number' && cleanedValue !== '' ? parseFloat(cleanedValue) : cleanedValue,
      };
      // Se cambia label, aggiorna anche name in camelCase
      if (name === 'label') {
        updated.name = toCamelCase(cleanedValue);
      }
      return updated;
    });
  };

  const submit = useCallback(async () => {
    try {
      if (!materiale._id) {
        setErrorMessage('ID materiale mancante.');
        return false;
      }
      // Costruzione oggetto materiale aggiornato tramite funzione centralizzata
      const materialeAggiornato = buildMaterialeFromFormData(formData);
      // Mantieni i valori obbligatori che non devono cambiare
      materialeAggiornato.quantita = materiale.quantita;
      materialeAggiornato.dataCreazione = materiale.dataCreazione;

      // Validazione con Zod
      const validation = MaterialeSchema.safeParse(materialeAggiornato);
      if (!validation.success) {
        setErrorMessage('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
        return false;
      }

      await updateMaterialeCompleto(materiale._id.toString(), materialeAggiornato);
      setErrorMessage(null);
      router.refresh();
      return true;
    } catch (error) {
      console.error('Errore durante il submit:', error);
      setErrorMessage('Errore durante il submit.');
      return false;
    }
  }, [formData, materiale, router, updateMaterialeCompleto]);

  const reset = useCallback(() => {
    if (materiale) {
      setFormData({
        nomeMateriale: materiale.nomeMateriale,
        label: materiale.label || '',
        codiceColore: materiale.codiceColore || '',
        codiceFornitore: materiale.codiceFornitore || '',
        fornitore: materiale.fornitore || '',
        tipo: materiale.tipo || '',
        stato: materiale.stato || '',
        utilizzo: materiale.utilizzo,
        noteMateriale: materiale.noteMateriale || '',
      });
    }
  }, [materiale]);

  const submitRef = useRef(submit);
  const resetRef = useRef(reset);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);

  useEffect(() => {
    useModalStore.getState().registerHandler('editMateriale', {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, []);

  return (
    <MaterialeFormLayout
      title="Modifica materiale"
      formData={formData}
      handleChange={handleChange}
      fieldList={materialeFieldsCreate}
      errorMessage={errorMessage}
    >
      {/* Eventuali children custom, ad esempio pulsanti */}
    </MaterialeFormLayout>
  );
}
