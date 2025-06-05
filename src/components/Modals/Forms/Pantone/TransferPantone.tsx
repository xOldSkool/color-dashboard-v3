import { Pantone } from '@/types/pantoneTypes';
import { useUpdatePantone } from '@/hooks/usePantone';
import { useUpdateMagazzinoPantoni } from '@/hooks/useUpdateMagazzinoPantoni';
import { useMagazzinoPantoni } from '@/hooks/useMagazzinoPantoni';
import { useModalStore } from '@/store/useModalStore';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

interface TransferPantoneProps {
  pantone: Pantone;
}

export default function TransferPantone({ pantone }: TransferPantoneProps) {
  const { updatePantone } = useUpdatePantone();
  const { updateMagazzinoPantoni } = useUpdateMagazzinoPantoni();
  // Recupera il magazzinoPantone per ottenere la disponibilità attuale
  const { magazzinoPantone } = useMagazzinoPantoni({
    pantoneGroupId: pantone.pantoneGroupId,
    tipo: pantone.tipo,
  });
  const closeModal = useModalStore((s) => s.closeModal);
  const router = useRouter();

  // Handler per invio in produzione
  const handleProduzione = async () => {
    await updatePantone(String(pantone._id), {
      daProdurre: false,
      qtDaProdurre: 0,
      battuteDaProdurre: 0,
      consegnatoProduzione: true,
      qtConsegnataProduzione: pantone.qtDaProdurre ?? 0,
    });
    closeModal('transferPantone');
    router.refresh();
  };

  // Handler per invio in magazzino
  const handleMagazzino = async () => {
    const qt = pantone.qtDaProdurre ?? 0;
    const dispMagazzino = magazzinoPantone?.dispMagazzino ?? 0;
    await updatePantone(String(pantone._id), {
      daProdurre: false,
      qtDaProdurre: 0,
      battuteDaProdurre: 0,
    });
    await updateMagazzinoPantoni({
      pantoneGroupId: pantone.pantoneGroupId,
      tipo: pantone.tipo,
      dispMagazzino: dispMagazzino + qt,
      ultimoUso: new Date().toISOString(),
      movimento: {
        tipo: 'carico',
        quantita: qt,
        data: new Date().toISOString(),
        causale: 'Composizione pantone',
      },
    });
    closeModal('transferPantone');
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <p className="text-lg font-medium text-center mb-2">Vuoi inviare il pantone al magazzino o alla produzione?</p>
      <div className="flex flex-row gap-6">
        <Button onClick={handleMagazzino} variant="primary">
          Magazzino
        </Button>
        <Button onClick={handleProduzione} variant="secondary">
          Produzione
        </Button>
      </div>
    </div>
  );
}
