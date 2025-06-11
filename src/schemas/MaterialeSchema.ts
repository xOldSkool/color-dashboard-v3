import { z } from 'zod';
const REQUIRED_FIELD_MSG = 'Il campo è obbligatorio';

// Movimento per carico
export const MovimentoCaricoSchema = z.object({
  tipo: z.literal('carico'),
  quantita: z.number(),
  data: z.union([z.string(), z.date()]),
  noteOperatore: z.string().optional(),
  causale: z.string(),
  DDT: z.string(), // obbligatorio solo per carico
  dataDDT: z.union([z.string(), z.date()]), // obbligatorio solo per carico
  riferimentoPantone: z.string().optional(),
});

// Movimento per scarico
export const MovimentoScaricoSchema = z.object({
  tipo: z.literal('scarico'),
  quantita: z.number(),
  data: z.union([z.string(), z.date()]),
  noteOperatore: z.string().optional(),
  causale: z.string(),
  DDT: z.string().optional(),
  dataDDT: z.union([z.string(), z.date()]).optional(),
  riferimentoPantone: z.string().optional(),
  fromUnload: z.boolean().optional(),
});

// Unione discriminata
export const MovimentoSchema = z.discriminatedUnion('tipo', [MovimentoCaricoSchema, MovimentoScaricoSchema]);

export const MaterialeSchema = z.object({
  _id: z.union([z.string(), z.any()]),
  nomeMateriale: z.string().min(1),
  label: z.string().min(1, REQUIRED_FIELD_MSG),
  codiceColore: z.string().optional().nullable(),
  codiceFornitore: z.string().optional().nullable(),
  quantita: z.number().min(0, REQUIRED_FIELD_MSG),
  fornitore: z.string().min(1, REQUIRED_FIELD_MSG),
  tipo: z.enum(['EB', 'UV']),
  stato: z.enum(['In uso', 'Obsoleto', 'Da verificare']),
  utilizzo: z.array(z.enum(['Base', 'Materiale', 'Pantone'])),
  noteMateriale: z.string().optional().nullable(),
  dataCreazione: z.union([z.string(), z.date()]).optional(),
  movimenti: z.array(MovimentoSchema).optional(),
});

// export const MaterialeSchemaOpzionale = z.object({
//   _id: z.union([z.string(), z.any()]),
//   nomeMateriale: z.string().min(1, REQUIRED_FIELD_MSG),
//   label: z.string().min(1, REQUIRED_FIELD_MSG),
//   codiceColore: z.string().optional().nullable(),
//   codiceFornitore: z.string().optional().nullable(),
//   quantita: z.number().min(0, REQUIRED_FIELD_MSG),
//   fornitore: z.string().min(1, REQUIRED_FIELD_MSG),
//   tipo: z.enum(['EB', 'UV']),
//   stato: z.enum(['In uso', 'Obsoleto', 'Da verificare']),
//   utilizzo: z.array(z.enum(['Base', 'Materiale', 'Pantone'])),
//   noteMateriale: z.string().optional().nullable(),
//   dataCreazione: z.union([z.string(), z.date()]).optional(),
//   movimenti: z.array(MovimentoSchema).optional(),
// });
