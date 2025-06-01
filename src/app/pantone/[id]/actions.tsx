'use client';
import Button from '@/components/Button';
import { useModalStore } from '@/store/useModalStore';
import { Pantone } from '@/types/pantoneTypes';

export default function PantoneActions({ pantone }: { pantone: Pantone }) {
  const { openModal } = useModalStore();
  return (
    <div className="flex flex-row gap-2 justify-end">
      <Button
        iconName="send"
        variant="primary"
        // onClick={handleDeliverClick}
      >
        Consegna
      </Button>
      <Button
        iconName="paintBucket"
        variant="primary"
        // onClick={handleProduceClick}
      >
        Componi
      </Button>
      <Button modalKey="editPantone" iconName="edit" variant="secondary" onClick={() => openModal('editPantone', pantone)}>
        Modifica
      </Button>
      <Button modalKey="deletePantone" iconName="delete" variant="danger" onClick={() => openModal('deletePantone', pantone)}>
        Elimina
      </Button>
    </div>
  );
}
