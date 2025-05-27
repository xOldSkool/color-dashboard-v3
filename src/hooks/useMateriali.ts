import { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseMateriale } from '@/types/materialeTypes';

export const useBasiMateriali = (tipo?: string) => {
  const [basi, setBasi] = useState<BaseMateriale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tipo) {
      setBasi([]);
      return;
    }

    const fetchBasi = async () => {
      setLoading(true);
      try {
        const response = await axios.get<BaseMateriale[]>(`/api/materiali?tipo=${encodeURIComponent(tipo)}`);
        const data = response.data.map((m) => ({
          name: m.name,
          label: m.label || m.name,
          codiceColore: m.codiceColore,
          codiceFornitore: m.codiceFornitore,
          fornitore: m.fornitore,
          tipo: m.tipo,
          stato: m.stato,
          utilizzo: m.utilizzo,
          quantita: m.quantita,
          _id: m._id,
        }));
        setBasi(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Errore nel recupero delle basi');
      } finally {
        setLoading(false);
      }
    };

    fetchBasi();
  }, [tipo]);

  return { basi, loading, error };
};
