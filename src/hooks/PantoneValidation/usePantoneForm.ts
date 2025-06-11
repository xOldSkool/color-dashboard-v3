import { useState, useCallback, useRef, useEffect } from 'react';
import { useModalStore, ModalKey } from '@/store/useModalStore';

export function usePantoneForm({
  initialData = {},
  onSubmit,
  onSuccess,
  onError,
  validateFields = [],
  modalKey = 'newPantone',
}: {
  initialData?: Record<string, string | number | undefined>;
  onSubmit?: (formData: Record<string, string | number | undefined>) => Promise<boolean>;
  onSuccess?: () => void;
  onError?: (error?: unknown) => void;
  validateFields?: string[];
  modalKey?: ModalKey;
}) {
  const [formData, setFormData] = useState<Record<string, string | number | undefined>>(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref per evitare update depth loop
  const lastValidRef = useRef<boolean | null>(null);

  // Gestione validità form
  useEffect(() => {
    if (validateFields.length > 0) {
      const isValid = validateFields.every((field) => {
        const value = formData[field];
        return value !== undefined && value !== '' && value !== null;
      });
      if (lastValidRef.current !== isValid) {
        useModalStore.getState().setFormValid(modalKey, isValid);
        lastValidRef.current = isValid;
      }
    }
  }, [formData, validateFields, modalKey]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const cleanedValue = typeof value === 'string' ? value.replace(',', '.') : value;
      setFormData((prev) => ({
        ...prev,
        [name]: cleanedValue,
      }));
    },
    [setFormData]
  );

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
