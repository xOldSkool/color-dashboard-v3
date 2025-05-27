import { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseMateriale } from '@/types/materialeTypes';

export const useBasiMateriali = () => {
  const [basi, setBasi] = useState<BaseMateriale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBasi = async () => {
      try {
        const response = await axios.get<BaseMateriale[]>('/api/materiali/');
        const data = response.data.map((m) => ({
          name: m.name,
          label: m.label || m.name,
          codiceColore: m.codiceColore,
          codiceFornitore: m.codiceFornitore,
          fornitore: m.fornitore,
          tipo: m.tipo,
          stato: m.stato,
          utilizzo: m.utilizzo,
          _id: m._id,
        }));
        setBasi(data);
      } catch (err) {
        console.error(err);
        setError('Errore nel recupero delle basi');
      } finally {
        setLoading(false);
      }
    };

    fetchBasi();
  }, []);

  return { basi, loading, error };
};
