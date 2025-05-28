'use client';
import { useModalStore } from '@/store/useModalStore';
import NewForm from './Forms/Pantone/NewForm';
import Modal from './Modal';
import { useTableStore } from '@/store/useTableStore';
import EditForm from './Forms/Pantone/EditForm';
// import { useRouter } from 'next/router';
// import { useTableStore } from '@/store/useTableStore';

export default function ModalManager() {
  // const router = useRouter();
  const { selectedPantoni } = useTableStore();
  const { modals, closeModal } = useModalStore();

  if (!modals) return null;

  return (
    <>
      {modals.newPantone && (
        <Modal title="Aggiungi Pantone" modalKey="newPantone" onClose={() => closeModal('newPantone')}>
          <NewForm />
        </Modal>
      )}
      {modals.editPantone && (
        <Modal title="Modifica Pantone" modalKey="editPantone" onClose={() => closeModal('editPantone')}>
          <EditForm pantone={selectedPantoni[0]} />
        </Modal>
      )}
    </>
  );
}
