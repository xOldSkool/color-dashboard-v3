import { useModalStore } from '@/store/useModalStore';
import { useUpdatePantone } from '@/hooks/usePantone';
import { useUpdateMagazzinoPantoni } from '@/hooks/useUpdateMagazzinoPantoni';
import { useMagazzinoPantoni } from '@/hooks/useMagazzinoPantoni';
import { useLoadPantone } from '@/hooks/useLoadPantone';
import { usePantoneMateriali } from '@/hooks/useMateriali';
import { Pantone, BasiPantone } from '@/types/pantoneTypes';
import Button from '@/components/Button';
import { normalizzaBasi } from '@/lib/pantoni/normalizzaBasi';
import { useRouter } from 'next/navigation';

// Utility per deep clean di oggetti (rimuove undefined/null ricorsivamente)
function deepClean<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.filter((v) => v !== undefined && v !== null).map((v) => (typeof v === 'object' && v !== null ? deepClean(v) : v)) as T;
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) {
        (acc as Record<string, unknown>)[k] = typeof v === 'object' ? deepClean(v) : v;
      }
      return acc;
    }, {} as T);
  }
  return obj;
}

// Filtro type-safe per basi valide
const isValidBase = (b: BasiPantone) =>
  typeof b.nomeMateriale === 'string' &&
  typeof b.label === 'string' &&
  typeof b.codiceFornitore === 'string' &&
  typeof b.codiceColore === 'string' &&
  typeof b.tipo === 'string' &&
  typeof b.fornitore === 'string' &&
  typeof b.quantita === 'number' &&
  !isNaN(b.quantita);

interface ReturnPantonePartialProps {
  pantone: Pantone;
  quantita: number;
  onSuccess?: () => void;
}

export default function ReturnPantonePartialModal({ pantone, quantita, onSuccess }: ReturnPantonePartialProps) {
  const router = useRouter();
  const { updatePantone } = useUpdatePantone();
  const { updateMagazzinoPantoni } = useUpdateMagazzinoPantoni();
  const { magazzinoPantone } = useMagazzinoPantoni({
    pantoneGroupId: pantone.pantoneGroupId,
    tipo: pantone.tipo,
  });
  const { loadPantone } = useLoadPantone();
  const { pantoneMateriali } = usePantoneMateriali();

  // Handler per "Usata"
  const handleUsata = async () => {
    // Filtra solo basi valide e normalizza utilizzo come array di stringhe
    const basiPulite = Array.isArray(pantone.basi)
      ? pantone.basi.filter(isValidBase).map((b) => {
          const rawUtilizzo = (b as { utilizzo?: unknown }).utilizzo;
          let utilizzoArr: string[] = [];
          if (Array.isArray(rawUtilizzo)) {
            utilizzoArr = rawUtilizzo.map((v: unknown) => String(v));
          } else if (typeof rawUtilizzo === 'string' && rawUtilizzo.length > 0) {
            utilizzoArr = (rawUtilizzo as string)
              .split(',')
              .map((v: string) => v.trim())
              .filter(Boolean);
          }
          return { ...b, utilizzo: utilizzoArr };
        })
      : [];
    const updatePayload = deepClean({
      _id: pantone._id,
      nomePantone: pantone.nomePantone,
      variante: pantone.variante,
      dataCreazione: pantone.dataCreazione,
      ultimoUso: new Date().toISOString(),
      articolo: pantone.articolo,
      cliente: pantone.cliente,
      tipoCarta: pantone.tipoCarta,
      fornitoreCarta: pantone.fornitoreCarta,
      passoCarta: pantone.passoCarta,
      hCarta: pantone.hCarta,
      stato: pantone.stato,
      tipo: pantone.tipo,
      descrizione: pantone.descrizione,
      consumo: pantone.consumo,
      dose: pantone.dose,
      pantoneGroupId: pantone.pantoneGroupId,
      is: pantone.is,
      noteArticolo: pantone.noteArticolo,
      urgente: pantone.urgente,
      noteColore: pantone.noteColore,
      daProdurre: pantone.daProdurre,
      qtDaProdurre: pantone.qtDaProdurre,
      battuteDaProdurre: pantone.battuteDaProdurre,
      basi: basiPulite,
      basiNormalizzate: normalizzaBasi(basiPulite),
      hex: pantone.hex,
    });
    await updatePantone(String(pantone._id), {
      ...updatePayload,
      consegnatoProduzione: false,
      qtConsegnataProduzione: 0,
    });
    // --- LOGICA CENTRALIZZATA: aggiorna anche materiali se serve ---
    const basePantone = basiPulite.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'));
    if (basePantone) {
      const materiale = pantoneMateriali.find((m) => m.nomeMateriale === basePantone.nomeMateriale && m.fornitore === basePantone.fornitore);
      if (!materiale) return;
      const result = await loadPantone({
        materialeId: String(materiale._id),
        nomeMateriale: materiale.nomeMateriale,
        fornitore: materiale.fornitore,
        quantita,
        causale: 'Rientro produzione (usata)',
      });
      if (!result.success) return;
    } else {
      await updateMagazzinoPantoni({
        pantoneGroupId: pantone.pantoneGroupId,
        tipo: pantone.tipo,
        dispMagazzino: (magazzinoPantone?.dispMagazzino ?? 0) + quantita,
        ultimoUso: new Date().toISOString(),
        movimento: {
          tipo: 'carico',
          quantita,
          data: new Date().toISOString(),
          causale: 'Rientro produzione (usata)',
        },
      });
    }
    useModalStore.getState().closeModal('returnPantonePartial');
    useModalStore.getState().closeModal('returnPantone'); // chiude anche la modale precedente
    router.refresh();
    if (onSuccess) onSuccess();
  };

  // Handler per "Rimane in produzione"
  const handleRimane = async () => {
    // Filtra solo basi valide e normalizza utilizzo come array di stringhe
    const basiPulite = Array.isArray(pantone.basi)
      ? pantone.basi.filter(isValidBase).map((b) => {
          const rawUtilizzo = (b as { utilizzo?: unknown }).utilizzo;
          let utilizzoArr: string[] = [];
          if (Array.isArray(rawUtilizzo)) {
            utilizzoArr = rawUtilizzo.map((v: unknown) => String(v));
          } else if (typeof rawUtilizzo === 'string' && rawUtilizzo.length > 0) {
            utilizzoArr = (rawUtilizzo as string)
              .split(',')
              .map((v: string) => v.trim())
              .filter(Boolean);
          }
          return { ...b, utilizzo: utilizzoArr };
        })
      : [];
    // Calcola la nuova qtConsegnataProduzione residua
    const nuovaQtConsegnataProduzione = (typeof pantone.qtConsegnataProduzione === 'number' ? pantone.qtConsegnataProduzione : 0) - quantita;
    const updatePayload = deepClean({
      _id: pantone._id,
      nomePantone: pantone.nomePantone,
      variante: pantone.variante,
      dataCreazione: pantone.dataCreazione,
      ultimoUso: new Date().toISOString(),
      articolo: pantone.articolo,
      cliente: pantone.cliente,
      tipoCarta: pantone.tipoCarta,
      fornitoreCarta: pantone.fornitoreCarta,
      passoCarta: pantone.passoCarta,
      hCarta: pantone.hCarta,
      stato: pantone.stato,
      tipo: pantone.tipo,
      descrizione: pantone.descrizione,
      consumo: pantone.consumo,
      dose: pantone.dose,
      pantoneGroupId: pantone.pantoneGroupId,
      is: pantone.is,
      noteArticolo: pantone.noteArticolo,
      urgente: pantone.urgente,
      noteColore: pantone.noteColore,
      daProdurre: pantone.daProdurre,
      qtDaProdurre: pantone.qtDaProdurre,
      battuteDaProdurre: pantone.battuteDaProdurre,
      basi: basiPulite,
      basiNormalizzate: normalizzaBasi(basiPulite),
      hex: pantone.hex,
    });
    await updatePantone(String(pantone._id), {
      ...updatePayload,
      consegnatoProduzione: true,
      qtConsegnataProduzione: nuovaQtConsegnataProduzione,
    });
    // --- LOGICA CENTRALIZZATA: aggiorna anche materiali se serve ---
    const basePantone = basiPulite.find((b) => Array.isArray(b.utilizzo) && b.utilizzo.includes('Pantone'));
    if (basePantone) {
      const materiale = pantoneMateriali.find((m) => m.nomeMateriale === basePantone.nomeMateriale && m.fornitore === basePantone.fornitore);
      if (!materiale) return;
      const result = await loadPantone({
        materialeId: String(materiale._id),
        nomeMateriale: materiale.nomeMateriale,
        fornitore: materiale.fornitore,
        quantita,
        causale: 'Rientro produzione (rimane)',
      });
      if (!result.success) return;
    } else {
      await updateMagazzinoPantoni({
        pantoneGroupId: pantone.pantoneGroupId,
        tipo: pantone.tipo,
        dispMagazzino: (magazzinoPantone?.dispMagazzino ?? 0) + quantita,
        ultimoUso: new Date().toISOString(),
        movimento: {
          tipo: 'carico',
          quantita,
          data: new Date().toISOString(),
          causale: 'Rientro produzione (rimane)',
        },
      });
    }
    useModalStore.getState().closeModal('returnPantonePartial');
    useModalStore.getState().closeModal('returnPantone'); // chiude anche la modale precedente
    router.refresh();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="flex flex-col gap-6 text-lg text-[var(--text)] p-4">
      <div className="mb-2">Hai effettuato un rientro parziale. L&apos;eccedenza è stata utilizzata o rimane per uso futuro?</div>
      <div className="flex flex-row gap-4">
        <Button variant="secondary" className="flex-1" onClick={handleUsata}>
          Usata
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleRimane}>
          Rimane in produzione
        </Button>
      </div>
    </div>
  );
}
