import { ObjectId } from 'mongodb';

export interface MovimentoMagazzino {
  tipo: 'carico' | 'scarico';
  quantita: number;
  data: Date | string;
  causale: string;
}

export interface MagazzinoPantoni {
  _id: ObjectId | string;
  pantoneGroupId: string;
  dispMagazzino: number;
  tipo: 'EB' | 'UV';
  ultimoUso: Date | string;
  noteMagazzino?: string;
  count?: number;
  movimenti?: MovimentoMagazzino[];
}

// Voglio aggiungere alla toolbar un bottone 'Esporta', visibile in tutte le tabelle tranne 'daProdurre' e 'consegnati-produzione' con icona 'FileInput'. Al click si apre la modale (con 'showFooter: false') 'exportToFile' con all'interno il file 'ExportToFile' presente in /components/Modals/Forms. Questo componente fa scegliere all'utente tra i formati excel e csv e mostra un bottone 'Download' per scaricare il file. Il componente prende le colonne visibili nella tabella, le righe e le inserisce in un file con il formato scelto dall'utente. Procedi a implementare il codice.
