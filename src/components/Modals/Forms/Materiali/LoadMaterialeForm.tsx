'use client';
import { materialeFieldsMovimentoLoad } from '@/constants/inputFields';
import { useUpdateMateriale } from '@/hooks/useMateriali';
import { MaterialeSchema } from '@/schemas/MaterialeSchema';
import { useModalStore } from '@/store/useModalStore';
import { Materiale } from '@/types/materialeTypes';
import { getEnumValue } from '@/utils/getEnumValues';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

type FormDataState = {
  [key: string]: string;
};

interface LoadMaterialeFormProps {
  materiale: Materiale;
}

export default function LoadMaterialeForms({ materiale: materialeProp }: LoadMaterialeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>({});
  const { modalData, closeModal, registerHandler } = useModalStore();
  const materiale = materialeProp ?? (modalData as Materiale | undefined);
  const { updateMateriale } = useUpdateMateriale();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formDataRef = useRef<FormDataState>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      formDataRef.current = updated;
      return updated;
    });
  };

  const submit = useCallback(async () => {
    setErrorMessage(null);
    if (!materiale || !materiale._id) return false;
    const currentFormData = formDataRef.current;
    const movimento = {
      ...currentFormData,
      quantita: Number(currentFormData.quantita),
      data: new Date().toISOString(),
      tipo: getEnumValue(currentFormData.tipo, ['carico', 'scarico'] as const, 'carico'),
      noteOperatore: currentFormData.noteOperatore,
      causale: 'Arrivo fornitore',
      DDT: currentFormData.DDT,
      dataDDT: currentFormData.dataDDT,
      fromUnload: false,
    };
    const nuovaQuantita = materiale.quantita + movimento.quantita;
    const materialeAggiornato = {
      ...materiale,
      quantita: nuovaQuantita,
      movimenti: [...(materiale.movimenti || []), movimento],
    };

    const validation = MaterialeSchema.safeParse(materialeAggiornato);
    if (!validation.success) {
      setErrorMessage('Errore di validazione:\n' + validation.error.issues.map((e) => `${e.path.join('.')} - ${e.message}`).join('\n'));
      return false;
    }

    await updateMateriale(String(materiale._id), {
      quantita: nuovaQuantita,
      movimenti: [...(materiale.movimenti || []), movimento],
    });
    setErrorMessage(null);
    router.refresh();
    closeModal('loadMateriale');
    return true;
  }, [materiale, updateMateriale, router, closeModal]);

  const reset = useCallback(() => setFormData({}), []);

  useEffect(() => {
    registerHandler('loadMateriale', {
      submit,
      reset,
    });
  }, []);

  if (!materiale) return <p>Materiale non selezionato o errore nel processo. Contattare lo sviluppatore!</p>;

  return (
    <form className="space-y-4">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <p className="text-sm text-gray-500">
        Quantità attuale: <strong>{materiale.quantita}</strong> kg
      </p>
      {materialeFieldsMovimentoLoad.map((field) => (
        <div key={field.name}>
          <label className="block mb-1 font-semibold">{field.label}</label>
          {field.form === 'input' ? (
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              value={formData[field.name] || ''}
            />
          ) : (
            <textarea
              name={field.name}
              rows={field.rows}
              placeholder={field.placeholder}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              value={formData[field.name] || ''}
            />
          )}
        </div>
      ))}
    </form>
  );
}
