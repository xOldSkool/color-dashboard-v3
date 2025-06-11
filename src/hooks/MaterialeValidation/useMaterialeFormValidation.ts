import { useState, useCallback } from 'react';
import { ZodSchema, SafeParseReturnType } from 'zod';
import { Materiale } from '@/types/materialeTypes';
import { normalizzaMovimenti } from '@/lib/materiali/normalizzaMovimenti';
import toCamelCase from '@/utils/toCamelCase';

interface UseMaterialeFormValidationParams<T, U> {
  formData: T;
  setFormData: (updater: (prev: T) => T) => void;
  schema: ZodSchema<U>;
  buildMaterialeFromFormData: (formData: T) => Materiale;
}

export function useMaterialeFormValidation<T extends Record<string, unknown>, U>({
  formData,
  setFormData,
  schema,
  buildMaterialeFromFormData,
}: UseMaterialeFormValidationParams<T, U>) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  // Validazione campo per campo in tempo reale
  const handleChangeWithValidation = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, customValue?: string | number | string[]) => {
      const { name, value } = e.target;
      const nextValue: string | number | string[] = customValue !== undefined ? customValue : value;
      setFormData((prev) => {
        // Cast esplicito per garantire compatibilità con l'indice stringa
        const updatedFormData: Record<string, string | number | string[] | undefined> = { ...prev, [name]: nextValue };
        // Auto-completamento campo name da label
        if (name === 'label' && typeof value === 'string') {
          updatedFormData['name'] = toCamelCase(value);
        }
        // Validazione
        const materiale = buildMaterialeFromFormData(updatedFormData as T);
        const partial = { ...materiale, movimenti: normalizzaMovimenti(materiale.movimenti) };
        const validation: SafeParseReturnType<U, U> = schema.safeParse(partial);
        setFieldErrors((prevErr) => {
          if (!validation.success) {
            const errorForField = validation.error.issues.find((issue) => String(issue.path[0]) === name);
            return { ...prevErr, [name]: errorForField ? errorForField.message : undefined };
          } else {
            return { ...prevErr, [name]: undefined };
          }
        });
        return updatedFormData as T;
      });
    },
    [schema, buildMaterialeFromFormData, setFormData]
  );

  // Validazione globale (es. onSubmit)
  const validateAllFields = useCallback(() => {
    const materiale = buildMaterialeFromFormData(formData);
    const fullObj = { ...materiale, movimenti: normalizzaMovimenti(materiale.movimenti) };
    const validation: SafeParseReturnType<U, U> = schema.safeParse(fullObj);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        errors[key] = issue.message;
      });
      setFieldErrors(errors);
      return errors;
    }
    setFieldErrors({});
    return undefined;
  }, [formData, schema, buildMaterialeFromFormData]);

  return {
    fieldErrors,
    setFieldErrors,
    handleChangeWithValidation,
    validateAllFields,
  };
}
