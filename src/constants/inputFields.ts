import { Field } from '@/types/constantsTypes';

export const pantoneFieldsLeft: Field[] = [
  {
    form: 'input',
    type: 'text',
    name: 'nomePantone',
    label: 'Nome Pantone',
    placeholder: 'Inserisci il pantone',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'variante',
    label: 'Variante',
    placeholder: 'Variante',
  },
  {
    form: 'input',
    type: 'text',
    name: 'articolo',
    label: 'Articolo',
    placeholder: 'Inserisci articolo',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'is',
    label: 'IS',
    placeholder: 'Inserisci IS',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'cliente',
    label: 'Cliente',
    placeholder: 'Inserisci cliente',
    required: true,
  },
  {
    form: 'select',
    options: ['Seleziona...', 'Da verificare', 'In uso', 'Obsoleto'],
    name: 'stato',
    label: 'Stato',
    required: true,
  },
];

export const pantoneFieldsCenter: Field[] = [
  {
    form: 'input',
    type: 'text',
    name: 'tipoCarta',
    label: 'Tipo carta',
    placeholder: 'Inserisci la carta',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'fornitoreCarta',
    label: 'Fornitore carta',
    placeholder: 'Inserisci il fornitore della carta',
    required: true,
  },
  {
    form: 'input',
    type: 'number',
    name: 'passoCarta',
    label: 'Passo',
    placeholder: 'Inserisci il passo',
    required: true,
  },
  {
    form: 'input',
    type: 'number',
    name: 'hCarta',
    label: 'Altezza carta',
    placeholder: "Inserisci l'altezza carta",
    required: true,
  },
  {
    form: 'input',
    type: 'number',
    name: 'consumo',
    label: 'Consumo',
    placeholder: 'Consumo per 1000 battute',
  },
  {
    form: 'input',
    type: 'number',
    name: 'dose',
    label: 'Dose',
    placeholder: 'Inserisci dose',
    required: true,
  },
  {
    form: 'select',
    options: ['Seleziona...', 'EB', 'UV'],
    name: 'tipo',
    label: 'Tipo',
    required: true,
  },
];

export const pantoneNotes: Field[] = [
  {
    form: 'textarea',
    name: 'descrizione',
    label: 'Descrizione',
    placeholder: 'Inserisci descrizione',
    rows: 4,
  },
  {
    form: 'textarea',
    name: 'noteArticolo',
    label: 'Note articolo',
    placeholder: "Inserisci note per l'articolo",
    rows: 4,
  },
  {
    form: 'textarea',
    name: 'noteColore',
    label: 'Note colore',
    placeholder: 'Inserisci note per il colore',
    rows: 4,
  },
  {
    form: 'textarea',
    name: 'noteMagazzino',
    label: 'Note magazzino',
    placeholder: 'Inserisci note per il magazzino',
    rows: 4,
  },
];

// MATERIALI MATERIALI MATERIALI MATERIALI
// MATERIALI MATERIALI MATERIALI MATERIALI
// MATERIALI MATERIALI MATERIALI MATERIALI
// MATERIALI MATERIALI MATERIALI MATERIALI
// MATERIALI MATERIALI MATERIALI MATERIALI
// MATERIALI MATERIALI MATERIALI MATERIALI

export const materialeFieldsCreate: Field[] = [
  {
    form: 'input',
    type: 'text',
    name: 'name',
    label: 'Nome',
    placeholder: 'Inserisci nome',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'label',
    label: 'Nome materiale',
    placeholder: 'Inserisci denominazione',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'codiceColore',
    label: 'Codice colore',
    placeholder: 'Inserisci codice colore',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'codiceFornitore',
    label: 'Codice fornitore',
    placeholder: 'Inserisci codice fornitore',
    required: true,
  },
  {
    form: 'input',
    type: 'text',
    name: 'fornitore',
    label: 'Fornitore',
    placeholder: 'Inserisci fornitore',
    required: true,
  },
  {
    form: 'select',
    options: ['Seleziona...', 'EB', 'UV'],
    name: 'tipo',
    label: 'Tipo',
    required: true,
  },
  {
    form: 'select',
    options: ['Seleziona...', 'In uso', 'Obsoleto', 'Da verificare'],
    name: 'stato',
    label: 'Stato',
    required: true,
  },
  {
    form: 'select',
    options: ['Seleziona...', 'Base', 'Pantone', 'Materiale'],
    name: 'utilizzo',
    label: 'Utilizzo',
    required: true,
  },
  {
    form: 'textarea',
    name: 'noteMateriale',
    label: 'Note',
    placeholder: 'Eventuali note sul materiale',
    rows: 3,
  },
];

export const materialeFieldsMovimentoLoad: Field[] = [
  {
    form: 'input',
    type: 'number',
    name: 'quantita',
    label: 'Quantità',
    placeholder: 'Inserisci quantità',
    required: true,
  },
  {
    form: 'input',
    type: 'number',
    name: 'DDT',
    label: 'Numero DDT',
    placeholder: 'Inserisci il numero del DDT',
    required: true,
  },
  {
    form: 'input',
    type: 'date',
    name: 'dataDDT',
    label: 'Data DDT',
    placeholder: 'Inserisci data del DDT',
    required: true,
  },
  {
    form: 'textarea',
    name: 'noteOperatore',
    label: 'Note operatore',
    placeholder: 'Eventuali annotazioni',
    rows: 3,
  },
];

export const materialeFieldsMovimentoUnload: Field[] = [
  {
    form: 'input',
    type: 'number',
    name: 'quantita',
    label: 'Quantità',
    placeholder: 'Inserisci quantità',
    required: true,
  },
  {
    form: 'textarea',
    name: 'noteOperatore',
    label: 'Note operatore',
    placeholder: 'Eventuali annotazioni',
    rows: 3,
  },
];
