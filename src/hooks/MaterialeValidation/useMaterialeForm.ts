import { useState, useCallback, useRef, useEffect } from 'react';
import { useModalStore, ModalKey } from '@/store/useModalStore';
import toCamelCase from '@/utils/toCamelCase';

export function useMaterialeForm({
  initialData = {},
  onSubmit,
  onSuccess,
  onError,
  validateFields = [],
  modalKey = 'newMateriale',
}: {
  initialData?: Record<string, string | number | string[] | undefined>;
  onSubmit?: (formData: Record<string, string | number | string[] | undefined>) => Promise<boolean>;
  onSuccess?: () => void;
  onError?: (error?: unknown) => void;
  validateFields?: string[];
  modalKey?: ModalKey;
}) {
  const [formData, setFormData] = useState<Record<string, string | number | string[] | undefined>>(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref per evitare update depth loop
  const lastValidRef = useRef<boolean | null>(null);

  // Gestione validità form
  useEffect(() => {
    if (validateFields.length > 0) {
      const isValid = validateFields.every((field) => {
        const value = formData[field];
        return value !== undefined && value !== '' && value !== null && !(Array.isArray(value) && value.length === 0);
      });
      if (lastValidRef.current !== isValid) {
        useModalStore.getState().setFormValid(modalKey, isValid);
        lastValidRef.current = isValid;
      }
    }
  }, [formData, validateFields, modalKey]);

  // Effetto: sincronizza nomeMateriale con label ogni volta che label cambia
  useEffect(() => {
    const label = formData.label;
    if (typeof label === 'string') {
      const nomeMateriale = toCamelCase(label);
      if (formData.nomeMateriale !== nomeMateriale) {
        setFormData((prev) => ({ ...prev, nomeMateriale }));
      }
    }
  }, [formData.label, formData.nomeMateriale]);

  // Forza valore iniziale array per checkbox multipli (es. utilizzo)
  useEffect(() => {
    setFormData((prev) => {
      const utilizzo = prev.utilizzo;
      if (Array.isArray(utilizzo)) {
        return prev;
      }
      if (typeof utilizzo === 'string' && utilizzo) {
        // Normalizza stringa concatenata in array
        return {
          ...prev,
          utilizzo: utilizzo
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        };
      }
      // Se undefined o vuoto, array vuoto
      return { ...prev, utilizzo: [] };
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let nextValue: string | number | string[] = value;
    if (e.target instanceof HTMLInputElement && type === 'checkbox') {
      const checked = e.target.checked;
      setFormData((prev) => {
        if (Array.isArray(prev[name])) {
          if (checked) {
            nextValue = [...(prev[name] as string[]), value];
          } else {
            nextValue = (prev[name] as string[]).filter((v) => v !== value);
          }
        } else {
          nextValue = checked ? [value] : [];
        }
        return {
          ...prev,
          [name]: nextValue,
        };
      });
      return;
    }
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: nextValue,
      };
      // Auto-completamento campo nomeMateriale da label
      if (name === 'label' && typeof value === 'string') {
        updated['nomeMateriale'] = toCamelCase(value);
      }
      return updated;
    });
  }, []);

  const submit = useCallback(async () => {
    try {
      if (!onSubmit) return false;
      const result = await onSubmit(formData);
      if (result === true && onSuccess) onSuccess();
      if (result === false && onError) onError();
      setErrorMessage(null);
      return result;
    } catch (error) {
      setErrorMessage('Errore durante il submit.');
      if (onError) onError(error);
      return false;
    }
  }, [formData, onSubmit, onSuccess, onError]);

  const reset = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  // Per ModalManager
  const submitRef = useRef(submit);
  const resetRef = useRef(reset);
  useEffect(() => {
    submitRef.current = submit;
    resetRef.current = reset;
  }, [submit, reset]);
  useEffect(() => {
    useModalStore.getState().registerHandler(modalKey, {
      submit: () => submitRef.current(),
      reset: () => resetRef.current(),
    });
  }, [modalKey]);

  return {
    formData,
    setFormData,
    errorMessage,
    setErrorMessage,
    handleChange,
    submit,
    reset,
  };
}
