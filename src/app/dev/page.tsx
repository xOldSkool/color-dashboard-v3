import Button from '@/components/Button';

export default function Dev() {
  return (
    <>
      <div className="flex flex-row justify-end items-center gap-2">
        <Button modalKey="newPantone" iconName="plus" variant="primary">
          Crea nuovo Pantone
        </Button>
        <Button iconName="plus" variant="secondary">
          Bottone
        </Button>
        <Button iconName="plus" variant="danger">
          Bottone
        </Button>
        <Button iconName="plus" variant="outline">
          Bottone
        </Button>
        <Button iconName="plus" variant="ghost">
          Bottone
        </Button>
      </div>
    </>
  );
}
