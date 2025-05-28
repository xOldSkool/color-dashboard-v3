import { BaseItem } from '@/types/tablesTypes';
import { useTableStore } from '@/store/useTableStore';
import { ModalKey, useModalStore } from '@/store/useModalStore';
import { Pantone } from '@/types/pantoneTypes';
import { Materiale } from '@/types/materialeTypes';

export function useHandleTableToolbarAction<T extends BaseItem>(data: T[]) {
  const { selectedRows, setSelectedPantoni, setSelectedMateriali } = useTableStore();
  const { openModal } = useModalStore();

  const handleAction = (modalKey: ModalKey, minSelection = 1, maxSelection = 1, itemKey: 'pantoni' | 'materiali' = 'pantoni') => {
    const selected = data.filter((item) => selectedRows.includes(item._id.toString()));
    if (selected.length < minSelection || selected.length > maxSelection) {
      alert(selected.length < minSelection ? `Seleziona almeno ${minSelection} elemento/i!` : `Seleziona al massimo ${maxSelection} elemento/i!`);
      return;
    }

    if (itemKey === 'pantoni') {
      setSelectedPantoni(selected as Pantone[]);
    } else {
      setSelectedMateriali(selected as Materiale[]);
    }

    openModal(modalKey);
  };

  return { handleAction };
}

// USO DI handleAction:
//
// handleAction(modalKey, minSelection, maxSelection, itemKey)
//
// Descrizione:
// handleAction centralizza le azioni sulla toolbar della tabella,
// come comporre, consegnare, modificare o eliminare elementi.
//
// Parametri:
// - modalKey: stringa che identifica la modale da aprire (es. 'producePantone', 'editMateriale').
// - minSelection: numero minimo di elementi da selezionare per eseguire l'azione (default: 1).
// - maxSelection: numero massimo di elementi da selezionare (default: 1; Infinity per più selezioni).
// - itemKey: specifica se si tratta di 'pantoni' o 'materiali' (default: 'pantoni').
//
// Funzionamento:
// - Filtra l'array data in base agli ID selezionati (selectedRows).
// - Controlla se il numero di elementi selezionati è tra minSelection e maxSelection.
// - Se non rispetta i vincoli, mostra un alert e interrompe.
// - Altrimenti, imposta gli ID selezionati nello store e apre la modale specificata.
//
// Esempi:
// onClick={() => handleAction('producePantone')}
// onClick={() => handleAction('editMateriale', 1, 1, 'materiali')}
// onClick={() => handleAction('deletePantone', 1, Infinity)}
