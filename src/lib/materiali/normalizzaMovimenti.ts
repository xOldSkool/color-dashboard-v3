import { MovimentoMateriale } from '@/types/materialeTypes';
import { MovimentoCaricoSchema, MovimentoScaricoSchema } from '@/schemas/MaterialeSchema';
import { z } from 'zod';

/**
 * Normalizza un array di movimenti secondo gli schemi Zod.
 * Garantisce compatibilità tra tipi runtime e validazione Zod.
 * Documentazione: https://zod.dev/?id=discriminated-unions
 */
export function normalizzaMovimenti(
  movimenti: MovimentoMateriale[] | undefined
): Array<z.infer<typeof MovimentoCaricoSchema> | z.infer<typeof MovimentoScaricoSchema>> | undefined {
  if (!movimenti) return undefined;
  return movimenti.map((mov) => {
    if (mov.tipo === 'carico') {
      return MovimentoCaricoSchema.parse(mov);
    } else if (mov.tipo === 'scarico') {
      return MovimentoScaricoSchema.parse(mov);
    }
    throw new Error('Tipo movimento non valido');
  });
}
