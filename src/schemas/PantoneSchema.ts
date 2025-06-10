import { z } from 'zod/v4';
const REQUIRED_FIELD_MSG = 'Il campo è obbligatorio';

export const BasiPantoneSchema = z.object({
  nomeMateriale: z.string(),
  label: z.string(),
  codiceFornitore: z.string(),
  codiceColore: z.string(),
  tipo: z.string(),
  quantita: z.number().nonnegative(),
  fornitore: z.string(),
  utilizzo: z.array(z.string()),
});

export const PantoneSchema = z.object({
  _id: z.union([z.string(), z.any()]), // ObjectId (server) - stringa (client)
  nomePantone: z.string().refine(
    (val) => {
      if (val.startsWith('P')) {
        // Se inizia con "P", deve rispettare regex
        return /^P\d{1,5}[CU]$/.test(val);
      }
      // Altrimenti, accetta qualsiasi valore
      return true;
    },
    {
      message: 'Se il nome inizia con "P", deve seguire il formato P123C o P123U',
    }
  ),
  variante: z.string().min(1, REQUIRED_FIELD_MSG),
  dataCreazione: z.union([z.string(), z.date()]),
  ultimoUso: z.union([z.string(), z.date()]), // ISO - Date
  articolo: z.string().min(1, REQUIRED_FIELD_MSG),
  is: z.string().optional(),
  cliente: z.string().min(1, REQUIRED_FIELD_MSG),
  noteArticolo: z.string().optional(),
  urgente: z.boolean(),
  tipoCarta: z.string().min(1, REQUIRED_FIELD_MSG),
  fornitoreCarta: z.string().min(1, REQUIRED_FIELD_MSG),
  passoCarta: z.number().nonnegative().min(3, REQUIRED_FIELD_MSG),
  hCarta: z.number().nonnegative().min(3, REQUIRED_FIELD_MSG),
  hex: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Formato colore esadecimale non valido')
    .optional(),
  stato: z.enum(['In uso', 'Obsoleto', 'Da verificare'], REQUIRED_FIELD_MSG),
  tipo: z.enum(['EB', 'UV'], REQUIRED_FIELD_MSG),
  descrizione: z.string(),
  noteColore: z.string().optional(),
  consumo: z.number().nonnegative(),
  dose: z.number().nonnegative(),
  daProdurre: z.boolean().optional(),
  qtDaProdurre: z.number().optional(),
  battuteDaProdurre: z.number().optional(),
  consegnatoProduzione: z.boolean().optional(),
  qtConsegnataProduzione: z.number().optional(),
  pantoneGroupId: z.string(),
  basi: z.array(BasiPantoneSchema).optional(),
  basiNormalizzate: z.string().optional(),
});
