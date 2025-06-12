import { useState, useCallback } from 'react';
import { ZodSchema, SafeParseReturnType } from 'zod';
import { Materiale } from '@/types/materialeTypes';
import { normalizzaMovimenti } from '@/lib/materiali/normalizzaMovimenti';
import { MovimentoCaricoSchema, MovimentoScaricoSchema } from '@/schemas/MaterialeSchema';

interface UseMaterialeFormValidationParams<T, U> {
  formData: T;
  setFormData: (updater: (prev: T) => T) => void;
  schema: ZodSchema<U>;
  buildMaterialeFromFormData: (formData: T) => Materiale;
  isMovimento?: boolean; // aggiunto flag opzionale
}

export function useMaterialeFormValidation<T extends Record<string, unknown>, U>({
  formData,
  setFormData,
  schema,
  buildMaterialeFromFormData,
  isMovimento = false,
}: UseMaterialeFormValidationParams<T, U>) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  // Validazione campo per campo in tempo reale
  const handleChangeWithValidation = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, customValue?: string | number | string[]) => {
      const { name, value } = e.target;
      const nextValue = customValue !== undefined ? customValue : value;
      setFormData((prev) => ({ ...prev, [name]: nextValue }));

      if (isMovimento) {
        // Costruisci oggetto movimento coerente con lo schema
        // NB: qui si assume che formData abbia solo i campi del movimento
        const movimento: Record<string, unknown> = { ...formData, [name]: nextValue };
        // Forza i tipi corretti per i campi principali
        if ('quantita' in movimento) {
          movimento.quantita = typeof movimento.quantita === 'string' ? Number(movimento.quantita) : movimento.quantita;
        }
        if ('noteOperatore' in movimento) {
          movimento.noteOperatore = String(movimento.noteOperatore ?? '');
        }
        if ('tipo' in movimento && typeof movimento.tipo !== 'string') {
          movimento.tipo = 'scarico'; // fallback
        }
        // ...aggiungi qui eventuali normalizzazioni necessarie...
        const validation = schema.safeParse(movimento);
        if (!validation.success) {
          const errorForField = validation.error.issues.find((issue) => String(issue.path[0]) === name);
          setFieldErrors((prev) => ({ ...prev, [name]: errorForField ? errorForField.message : undefined }));
        } else {
          setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        return;
      }

      // Validazione campo singolo per materiale intero
      const materiale = buildMaterialeFromFormData({ ...formData, [name]: nextValue });
      const validation: SafeParseReturnType<U, U> = schema.safeParse(materiale);
      if (!validation.success) {
        const errorForField = validation.error.issues.find((issue) => String(issue.path[0]) === name);
        setFieldErrors((prev) => ({ ...prev, [name]: errorForField ? errorForField.message : undefined }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [formData, setFormData, schema, buildMaterialeFromFormData, isMovimento]
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

  // Validazione dedicata per i movimenti (carico/scarico) da usare nei form di creazione/modifica materiale
  const validateMovimento = useCallback((movimentoInput: Partial<Record<string, unknown>>, tipo: 'carico' | 'scarico') => {
    // Costruisci oggetto movimento coerente
    const movimento = {
      tipo,
      quantita: typeof movimentoInput.quantita === 'string' ? Number(movimentoInput.quantita) : (movimentoInput.quantita ?? 0),
      data:
        movimentoInput.dataDDT && typeof movimentoInput.dataDDT === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(movimentoInput.dataDDT as string)
          ? new Date((movimentoInput.dataDDT as string) + 'T00:00:00.000Z').toISOString()
          : (movimentoInput.data ?? new Date().toISOString()),
      noteOperatore: movimentoInput.noteOperatore !== undefined ? String(movimentoInput.noteOperatore) : undefined,
      causale:
        movimentoInput.causale !== undefined
          ? String(movimentoInput.causale)
          : tipo === 'carico'
            ? 'Arrivo fornitore'
            : 'Scarico effettuato da operatore',
      DDT: movimentoInput.DDT !== undefined ? String(movimentoInput.DDT).trim() : '',
      dataDDT:
        movimentoInput.dataDDT !== undefined
          ? /^\d{4}-\d{2}-\d{2}$/.test(movimentoInput.dataDDT as string)
            ? new Date((movimentoInput.dataDDT as string) + 'T00:00:00.000Z').toISOString()
            : String(movimentoInput.dataDDT)
          : '',
      riferimentoPantone: movimentoInput.riferimentoPantone !== undefined ? String(movimentoInput.riferimentoPantone) : undefined,
    };
    const schemaToUse = tipo === 'carico' ? MovimentoCaricoSchema : MovimentoScaricoSchema;
    const validation = schemaToUse.safeParse(movimento);
    return { movimento, validation };
  }, []);

  return {
    fieldErrors,
    setFieldErrors,
    handleChangeWithValidation,
    validateAllFields,
    validateMovimento,
  };
}
