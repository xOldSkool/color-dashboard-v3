import Button from '@/components/Button';
import Table from '@/components/Tables/Table';

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
