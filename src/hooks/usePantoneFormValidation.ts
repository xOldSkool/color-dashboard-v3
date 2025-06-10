import { useState, useCallback } from 'react';
import { ZodSchema, SafeParseReturnType } from 'zod';

interface UsePantoneFormValidationParams<T, U> {
  formData: T;
  schema: ZodSchema<U>;
  buildPantoneFromFormData: (args: {
    formData: T;
    basiRaggruppatePerName: Record<string, unknown>;
    pantoneEsternoSelezionato: string | null;
    pantoneMateriali: ReadonlyArray<unknown>;
  }) => U;
  basiRaggruppatePerName: Record<string, unknown>;
  pantoneEsternoSelezionato: string | null;
  pantoneMateriali: ReadonlyArray<unknown>;
}

export function usePantoneFormValidation<T extends Record<string, unknown>, U>({
  formData,
  schema,
  buildPantoneFromFormData,
  basiRaggruppatePerName,
  pantoneEsternoSelezionato,
  pantoneMateriali,
}: UsePantoneFormValidationParams<T, U>) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  // Validazione campo per campo in tempo reale
  const handleChangeWithValidation = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, customValue?: string | number) => {
      const { name, value } = e.target;
      const nextValue = customValue !== undefined ? customValue : value;
      // Validazione campo singolo
      const partial = buildPantoneFromFormData({
        formData: { ...formData, [name]: nextValue },
        basiRaggruppatePerName,
        pantoneEsternoSelezionato,
        pantoneMateriali,
      });
      const validation: SafeParseReturnType<U, U> = schema.safeParse(partial);
      if (!validation.success) {
        const errorForField = validation.error.issues.find((issue) => String(issue.path[0]) === name);
        setFieldErrors((prev) => ({ ...prev, [name]: errorForField ? errorForField.message : undefined }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [formData, schema, buildPantoneFromFormData, basiRaggruppatePerName, pantoneEsternoSelezionato, pantoneMateriali]
  );

  // Validazione globale (es. onSubmit)
  const validateAllFields = useCallback(() => {
    const fullObj = buildPantoneFromFormData({
      formData,
      basiRaggruppatePerName,
      pantoneEsternoSelezionato,
      pantoneMateriali,
    });
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
  }, [formData, schema, buildPantoneFromFormData, basiRaggruppatePerName, pantoneEsternoSelezionato, pantoneMateriali]);

  return {
    fieldErrors,
    setFieldErrors,
    handleChangeWithValidation,
    validateAllFields,
  };
}
