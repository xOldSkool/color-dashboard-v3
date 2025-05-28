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

export default function ModalManager() {
  const hasRegisteredProduceHandler = useRef(false);
  const router = useRouter();
  const { selectedPantoni, selectedTableKey, setSelectedPantoni } = useTableStore();
  const { modals, closeModal, openModal, registerHandler } = useModalStore();

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
    </>
  );
}
