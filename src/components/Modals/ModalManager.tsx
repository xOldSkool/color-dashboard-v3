'use client';
import { useModalStore } from '@/store/useModalStore';
import NewPantoneForm from './Forms/Pantone/NewPantoneForm';
import Modal from './Modal';
import { useTableStore } from '@/store/useTableStore';
import EditPantoneForm from './Forms/Pantone/EditPantoneForm';
import DuplicatePantone from './Forms/Pantone/DuplicatePantone';
import ColumnSelector, { TableKey } from '../Tables/ColumnsSelector';
import ProducePantoneForm from './Forms/Pantone/ProducePantoneForm';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NewMaterialeForm from './Forms/Materiali/NewMaterialeForm';
import EditMaterialeForm from './Forms/Materiali/EditMaterialeForm';
import LoadMaterialeForm from './Forms/Materiali/LoadMaterialeForm';
import UnloadMaterialeForm from './Forms/Materiali/UnloadMaterialeForm';
import { useDeletePantone } from '@/hooks/usePantone';

export default function ModalManager() {
  const router = useRouter();
  const { selectedPantoni, selectedTableKey, setSelectedPantoni, selectedMateriali, clearAll } = useTableStore();
  const { modals, closeModal, openModal, registerHandler } = useModalStore();
  const { removePantone } = useDeletePantone();

  const hasRegisteredProduceHandler = useRef(false);
  const hasRegisteredDeleteHandler = useRef(false);

  // DELETE PANTONE
  useEffect(() => {
    if (modals.deletePantone && !hasRegisteredDeleteHandler.current) {
      registerHandler('deletePantone', {
        submit: async () => {
          try {
            await removePantone(selectedPantoni.map((p) => p._id?.toString()).filter((id): id is string => typeof id === 'string'));
            clearAll();
            closeModal('deletePantone');
            router.refresh();
          } catch (error) {
            console.error('Errore durante eliminazione:', error);
          }
        },
      });
      hasRegisteredDeleteHandler.current = true;
    }
    if (!modals.deletePantone) {
      hasRegisteredDeleteHandler.current = false;
    }
  }, [modals.deletePantone]);

  // PRODUCE PANTONE
  useEffect(() => {
    if (modals.producePantone && !hasRegisteredProduceHandler.current) {
      registerHandler('producePantone', {
        submit: async () => {
          const pantone = selectedPantoni[0];
          const battute = Number((document.getElementById('numerobattute') as HTMLInputElement | null)?.value);

          if (!battute || isNaN(battute) || battute <= 0) {
            alert('Numero di battute non valido');
            return;
          }
          if (!pantone._id) {
            alert('ID Pantone mancante.');
            return false;
          }

          const totale = pantone.basi ? pantone.basi.filter((b) => b.quantita > 0).reduce((acc, b) => acc + (b.quantita * battute) / 1000, 0) : 0;

          const isUrgente = (document.getElementById('urgente') as HTMLInputElement | null)?.checked ?? false;

          try {
            const { updatePantone } = await import('@/hooks/usePantone').then((m) => m.useUpdatePantone());

            await updatePantone(pantone._id.toString(), {
              daProdurre: true,
              qtDaProdurre: Number(totale.toFixed(4)),
              battuteDaProdurre: Number(battute),
              urgente: isUrgente,
            });

            router.refresh();
            closeModal('producePantone');
            setSelectedPantoni([pantone]);
            openModal('destinationPantone');
          } catch (error) {
            console.error('Errore aggiornamento produzione:', error);
          }
        },
      });
      hasRegisteredProduceHandler.current = true;
    }
    if (!modals.producePantone) {
      hasRegisteredProduceHandler.current = false;
    }
  }, [modals.producePantone]);

  if (!modals) return null;

  return (
    <>
      {/* {modals.filterPantone && (
        <Modal title="Filtra" modalKey="filterPantone" onClose={() => closeModal('filterPantone')}>
          contenuto
        </Modal>
      )} */}
      {modals.newPantone && (
        <Modal title="Aggiungi Pantone" modalKey="newPantone" onClose={() => closeModal('newPantone')}>
          <NewPantoneForm />
        </Modal>
      )}
      {modals.editPantone && (
        <Modal title="Modifica Pantone" modalKey="editPantone" onClose={() => closeModal('editPantone')}>
          <EditPantoneForm pantone={selectedPantoni[0]} />
        </Modal>
      )}
      {modals.duplicatePantone && (
        <Modal title="Duplica Pantone" modalKey="duplicatePantone" onClose={() => closeModal('duplicatePantone')}>
          <DuplicatePantone pantone={selectedPantoni[0]} />
        </Modal>
      )}
      {modals.deletePantone && (
        <Modal title="Conferma Eliminazione" modalKey="deletePantone" onClose={() => closeModal('deletePantone')}>
          <p className="pb-2">Stai eliminando:</p>
          <ul className="list-disc list-inside text-red-500">
            {selectedPantoni.map((p) => (
              <li key={p._id?.toString()}>{p.nomePantone}</li>
            ))}
          </ul>
        </Modal>
      )}
      {modals.selectColumns && (
        <Modal title="Seleziona Colonne" modalKey="selectColumns" onClose={() => closeModal('selectColumns')}>
          <ColumnSelector tableKey={selectedTableKey as TableKey} />
        </Modal>
      )}
      {modals.producePantone && (
        <Modal title="Componi Pantone" modalKey="producePantone" onClose={() => closeModal('producePantone')}>
          <ProducePantoneForm pantone={selectedPantoni[0]} />
        </Modal>
      )}

      {/* SEZIONE MATERIALI */}
      {/* SEZIONE MATERIALI */}
      {/* SEZIONE MATERIALI */}
      {/* SEZIONE MATERIALI */}
      {/* SEZIONE MATERIALI */}

      {modals.newMateriale && (
        <Modal title="Crea materiale" modalKey="newMateriale" onClose={() => closeModal('newMateriale')}>
          <NewMaterialeForm />
        </Modal>
      )}
      {modals.editMateriale && (
        <Modal title="Modifica Materiale" modalKey="editMateriale" onClose={() => closeModal('editMateriale')}>
          <EditMaterialeForm materiale={selectedMateriali[0]} />
        </Modal>
      )}
      {modals.loadMateriale && (
        <Modal title="Carica materiale" modalKey="loadMateriale" onClose={() => closeModal('loadMateriale')}>
          <LoadMaterialeForm materiale={selectedMateriali[0]} />
        </Modal>
      )}

      {modals.unloadMateriale && (
        <Modal title="Scarica materiale" modalKey="unloadMateriale" onClose={() => closeModal('unloadMateriale')}>
          <UnloadMaterialeForm materiale={selectedMateriali[0]} />
        </Modal>
      )}
    </>
  );
}
