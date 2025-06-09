'use client';
import React from 'react';
import InputMap from '@/components/InputMap';
import { materialeFieldsCreate } from '@/constants/inputFields';
import { useUpdateMaterialeCompleto } from '@/hooks/useMateriali';
import { MaterialeSchema } from '@/schemas/MaterialeSchema';
import { useModalStore } from '@/store/useModalStore';
import { getEnumValue } from '@/utils/getEnumValues';
import { Materiale } from '@/types/materialeTypes';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState, useCallback } from 'react';
import { materialeToFormData } from '@/lib/adapter';
import toCamelCase from '@/utils/toCamelCase';

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
        const prevArr = (prev.utilizzo ?? []) as string[];
        let newArr: string[];
        if (checked) {
          newArr = [...prevArr, value];
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
      const materialeAggiornato = {
        nomeMateriale: String(formData.name),
        label: String(formData.label || ''),
        codiceColore: String(formData.codiceColore || ''),
        codiceFornitore: String(formData.codiceFornitore || ''),
        fornitore: String(formData.fornitore || ''),
        tipo: getEnumValue(formData.tipo, ['EB', 'UV'] as const, 'EB'),
        stato: getEnumValue(formData.stato, ['In uso', 'Obsoleto', 'Da verificare'] as const, 'In uso'),
        utilizzo: (formData.utilizzo as string[]).filter((v): v is 'Base' | 'Materiale' | 'Pantone' => ['Base', 'Materiale', 'Pantone'].includes(v)),
        noteMateriale: String(formData.noteMateriale || ''),
        quantita: materiale.quantita, // obbligatorio per Materiale
        dataCreazione: materiale.dataCreazione, // obbligatorio per Materiale
      };

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
    <form>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <InputMap fields={materialeFieldsCreate} formData={formData} handleChange={handleChange} />
    </form>
  );
}
