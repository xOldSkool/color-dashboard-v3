import { z } from 'zod';

export const MaterialeSchema = z.object({
  _id: z.union([z.string(), z.any()]),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  label: z.string().min(1, 'La label è obbligatoria'),
  codiceColore: z.string().optional().nullable(),
  codiceFornitore: z.string().optional().nullable(),
  quantita: z.number().min(0, 'La quantità deve essere >= 0'),
  fornitore: z.string().min(1, 'Il fornitore è obbligatorio'),
  tipo: z.enum(['EB', 'UV']),
  stato: z.enum(['In uso', 'Obsoleto', 'Da verificare']),
  utilizzo: z.enum(['Base', 'Materiale']),
  noteMateriale: z.string().optional().nullable(),
  dataCreazione: z.union([z.string(), z.date()]).optional(),
  movimenti: z
    .array(
      z.object({
        tipo: z.enum(['carico', 'scarico']),
        quantita: z.number(),
        data: z.union([z.string(), z.date()]),
        noteOperatore: z.string().optional(),
        causale: z.string(),
        DDT: z.string(),
        dataDDT: z.union([z.string(), z.date()]),
        riferimentoPantone: z.string().optional(),
      })
    )
    .optional(),
});
