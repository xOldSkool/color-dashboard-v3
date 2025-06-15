import Button from '@/components/Button';

export default function InventarioActions({
  onSalva,
  onEsporta,
  isSaving = false,
  isExporting = false,
}: {
  onSalva: () => void;
  onEsporta: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
}) {
  return (
    <div className="flex flex-row gap-4 justify-end mt-6">
      <Button onClick={onSalva} variant="primary" iconName="save" isLoading={isSaving} tooltip="Salva le quantità reali">
        Salva
      </Button>
      <Button onClick={onEsporta} variant="secondary" iconName="file" isLoading={isExporting} tooltip="Esporta le quantità da ordinare">
        Esporta
      </Button>
    </div>
  );
}
