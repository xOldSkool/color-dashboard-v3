'use client';
import Button from '@/components/Button';
import { useModalStore } from '@/store/useModalStore';
import { Materiale } from '@/types/materialeTypes';

export default function MaterialeActions({ materiale }: { materiale: Materiale }) {
  const { openModal } = useModalStore();
  return (
    <div className="flex flex-row gap-2">
      <Button modalKey="loadMateriale" iconName="loadin" variant="primary" onClick={() => openModal('loadMateriale', materiale)}>
        Carico
      </Button>
      <Button modalKey="unloadMateriale" iconName="loadout" variant="primary" onClick={() => openModal('unloadMateriale', materiale)}>
        Scarico
      </Button>
    </div>
  );
}
