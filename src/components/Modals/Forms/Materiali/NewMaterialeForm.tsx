'use client';
import InputMap from '@/components/InputMap';
import { materialeFieldsCreate } from '@/constants/inputFields';
import { useCreateMateriale } from '@/hooks/useMateriali';
import { MaterialeSchema, MovimentoSchema } from '@/schemas/MaterialeSchema';
import { useModalStore } from '@/store/useModalStore';
import { getEnumValue } from '@/utils/getEnumValues';
import toCamelCase from '@/utils/toCamelCase';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { z } from 'zod';
import React from 'react';

export interface FormData {
  [key: string]: string | number | undefined;
}

const utilizzoOptions = ['Base', 'Materiale', 'Pantone'] as const;

export default function NewMaterialeForm() {
  const router = useRouter();
  const { createMateriale } = useCreateMateriale();
  const [formData, setFormData] = useState<FormData>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const cleanedValue = value.replace(',', '.');
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
      // Costruisci l'oggetto Materiale
      const nuovoMateriale = {
        nomeMateriale: String(formData.name),
        label: String(formData.label || ''),
        codiceColore: String(formData.codiceColore || ''),
        codiceFornitore: String(formData.codiceFornitore || ''),
        quantita: Number(formData.quantita) || 0,
        fornitore: String(formData.fornitore || ''),
        tipo: getEnumValue(formData.tipo, ['EB', 'UV'] as const, 'EB'),
        stato: getEnumValue(formData.stato, ['In uso', 'Obsoleto', 'Da verificare'] as const, 'In uso'),
        utilizzo: Array.isArray(formData.utilizzo) ? formData.utilizzo : [getEnumValue(formData.utilizzo, ['Base', 'Materiale', 'Pantone'] as const, 'Base')],
        noteMateriale: String(formData.noteMateriale || ''),
        dataCreazione: new Date().toISOString(),
        movimenti: [], // oppure logica per aggiungere movimenti
      };

      // Validazione con Zod
      if (nuovoMateriale.movimenti && nuovoMateriale.movimenti.length > 0) {
        const movimento = nuovoMateriale.movimenti[0];
        const movimentoValidation = MovimentoSchema.safeParse(movimento);
        if (!movimentoValidation.success) {
          alert('Errore di validazione movimento:\n' + movimentoValidation.error.issues.map((e: z.ZodIssue) => e.message).join('\n'));
          return false;
        }
      }
      const validation = MaterialeSchema.safeParse(nuovoMateriale);
      if (!validation.success) {
        alert('Errore di validazione:\n' + validation.error.issues.map((e: z.ZodIssue) => e.message).join('\n'));
        return false;
      }

      await createMateriale(nuovoMateriale);
      setErrorMessage(null);
      router.refresh();
      return true;
    } catch (error) {
      console.error('Errore durante il submit:', error);
      setErrorMessage('Errore durante il submit.');
      return false;
    }
  }, [router, formData, createMateriale]);

  const reset = useCallback(() => {
    const iniziale: { [key: string]: string | number } = {};
    [...materialeFieldsCreate].forEach((field) => {
      iniziale[field.name] = ''; // resettiamo tutto a stringa vuota
    });
    setFormData(iniziale);
  }, []);

  const submitRef = useRef(submit);
  const resetRef = useRef(reset);

  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);

  useEffect(() => {
    useModalStore.getState().registerHandler('newMateriale', {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, []);

  return (
    <form>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <InputMap fields={materialeFieldsCreate} formData={formData} handleChange={handleChange} />
      <div className="mb-4">
        <label className="block font-medium mb-1">Utilizzo</label>
        <div className="flex gap-4">
          {utilizzoOptions.map((option) => (
            <label key={option} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="utilizzo"
                value={option}
                checked={Array.isArray(formData.utilizzo) ? formData.utilizzo.includes(option) : false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => {
                    const current = Array.isArray(prev.utilizzo)
                      ? prev.utilizzo
                      : typeof prev.utilizzo === 'string' && prev.utilizzo.length > 0
                        ? prev.utilizzo.split(',')
                        : [];
                    let next: string[];
                    if (checked) {
                      next = [...current, option];
                    } else {
                      next = current.filter((v) => v !== option);
                    }
                    return { ...prev, utilizzo: next.join(',') };
                  });
                }}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}
