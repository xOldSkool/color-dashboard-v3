import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface ModificaInventario {
  id: string;
  quantitaReale: number;
}

export function useSalvaInventario() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const salvaInventario = async (modifiche: ModificaInventario[]): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await axios.post('/api/materiali/inventario', { modifiche });
      setSuccess(true);
      toast.success('Inventario salvato con successo!');
      return true;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const msg = e.response.data?.error || 'Errore salvataggio inventario';
        setError(msg);
        toast.error(msg);
      } else {
        setError(String(e));
        toast.error('Errore di rete o server');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { salvaInventario, isSaving, error, success };
}
