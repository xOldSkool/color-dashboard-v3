'use client';
import { useModalStore } from '@/store/useModalStore';
import NewPantoneForm from './Forms/Pantone/NewPantoneForm';
import Modal from './Modal';
import { useTableStore } from '@/store/useTableStore';
import EditPantoneForm from './Forms/Pantone/EditPantoneForm';
import DuplicatePantone from './Forms/Pantone/DuplicatePantone';
import ColumnSelector, { TableKey } from '../Tables/ColumnsSelector';
import ProducePantoneForm from './Forms/Pantone/ProducePantoneForm';
import RemoveFromToProduceForm from './Forms/Pantone/RemoveFromToProduceForm';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NewMaterialeForm from './Forms/Materiali/NewMaterialeForm';
import EditMaterialeForm from './Forms/Materiali/EditMaterialeForm';
import LoadMaterialeForm from './Forms/Materiali/LoadMaterialeForm';
import UnloadMaterialeForm from './Forms/Materiali/UnloadMaterialeForm';
import { useDeletePantone } from '@/hooks/usePantone';
import DeliverPantoneForm from './Forms/Pantone/DeliverPantoneForm';
import ReturnPantoneForm from './Forms/Pantone/ReturnPantoneForm';
import ReturnPantonePartialModal from './Forms/Pantone/ReturnPantonePartialModal';
import MarkPantoneAsConsumed from './Forms/Pantone/MarkPantoneAsConsumed';
import TransferPantone from './Forms/Pantone/TransferPantone';
import ExportToFile from './Forms/ExportToFile';

export default function ModalManager() {
  const router = useRouter();
  const { selectedPantoni, selectedTableKey, selectedMateriali, clearAll } = useTableStore();
  const { modals, closeModal, registerHandler } = useModalStore();
  const { removePantone } = useDeletePantone();

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
  }, [modals.deletePantone, clearAll, closeModal, registerHandler, removePantone, selectedPantoni, router]);

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
        <Modal title="Seleziona Colonne" modalKey="selectColumns" onClose={() => closeModal('selectColumns')} showFooter={false}>
          <ColumnSelector tableKey={selectedTableKey as TableKey} />
        </Modal>
      )}
      {modals.producePantone && (
        <Modal title="Componi Pantone" modalKey="producePantone" onClose={() => closeModal('producePantone')}>
          <ProducePantoneForm pantone={selectedPantoni[0]} onSuccess={() => closeModal('producePantone')} />
        </Modal>
      )}
      {modals.removeFromToProduce && (
        <Modal title="Annulla Produzione" modalKey="removeFromToProduce" onClose={() => closeModal('removeFromToProduce')}>
          <RemoveFromToProduceForm pantone={selectedPantoni[0]} />
        </Modal>
      )}
      {modals.deliverPantone && (
        <Modal title="Consegna Pantone" modalKey="deliverPantone" onClose={() => closeModal('deliverPantone')}>
          <DeliverPantoneForm pantone={selectedPantoni[0]} />
        </Modal>
      )}
      {modals.returnPantone && (
        <Modal title="Reso da Produzione" modalKey="returnPantone" onClose={() => closeModal('returnPantone')}>
          <ReturnPantoneForm pantone={selectedPantoni[0]} />
        </Modal>
      )}
      {modals.returnPantonePartial && (
        <Modal title="Rientro Parziale" modalKey="returnPantonePartial" onClose={() => closeModal('returnPantonePartial')} showFooter={false}>
          {/* @ts-expect-error modalData tipizzata dinamicamente */}
          <ReturnPantonePartialModal {...(useModalStore.getState().modalData || {})} />
        </Modal>
      )}
      {modals.markPantoneAsConsumed && (
        <Modal title="Reso da Produzione" modalKey="markPantoneAsConsumed" onClose={() => closeModal('markPantoneAsConsumed')}>
          <MarkPantoneAsConsumed pantone={selectedPantoni[0]} />
        </Modal>
      )}
      {modals.transferPantone && (
        <Modal title="Trasferisci Pantone" modalKey="transferPantone" onClose={() => closeModal('transferPantone')}>
          <TransferPantone pantone={selectedPantoni[0]} />
        </Modal>
      )}
      {modals.exportToFile && (
        <Modal title="Esporta dati" modalKey="exportToFile" onClose={() => closeModal('exportToFile')} showFooter={false}>
          {/* @ts-expect-error modalData tipizzata dinamicamente */}
          <ExportToFile {...(useModalStore.getState().modalData || {})} onClose={() => closeModal('exportToFile')} />
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
