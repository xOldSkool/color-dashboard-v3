import Button from '@/components/Button';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Button modalKey="newPantone" iconName="plus" variant="primary">
        Crea nuovo Pantone
      </Button>
    </>
  );
}
