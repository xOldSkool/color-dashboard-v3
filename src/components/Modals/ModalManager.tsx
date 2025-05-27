'use client';
import { useModalStore } from '@/store/useModalStore';
import NewForm from './Forms/Pantone/NewForm';
import Modal from './Modal';
// import { useRouter } from 'next/router';
// import { useTableStore } from '@/store/useTableStore';

export default function ModalManager() {
  // const router = useRouter();
  const { modals, closeModal } = useModalStore();

  return (
    <>
      {modals.newPantone && (
        <Modal title="Aggiungi Pantone" modalKey="newPantone" onClose={() => closeModal('newPantone')}>
          <NewForm />
        </Modal>
      )}
    </>
  );
}
