'use client';
import { useCallback, useEffect, useState } from 'react';
import { pantoneFieldsCenter, pantoneFieldsLeft, pantoneNotes } from '@/constants/inputFields';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/store/useModalStore';
import { getHexFromPantone } from '@/components/PantoneToHex';
import InputMap from '@/components/InputMap';
import Loader from '@/components/Loader';
import { useCreatePantone, useUpdatePantone } from '@/hooks/usePantone';

export default function PNewForm({ pantone, mode = 'new' }) {
  const { basi, loading: loadingBasi, error: errorBasi } = useBasiMateriali();

  const { registerHandler, closeModal } = useModalStore();
  const { create } = useCreatePantone();
  const { update } = useUpdatePantone();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Sempre inizializzato in modo sicuro
  const [formData, setFormData] = useState({});
  console.log('✅ formData.tipo:', formData?.tipo);
  console.log('✅ basi caricate dal DB:', basi);
  useEffect(() => {
    if (pantone) {
      setFormData({
        ...pantone,
        ...pantone.basi?.reduce((acc, b) => ({ ...acc, [b.name]: b.valore }), {}),
      });
    }
  }, [pantone]);

  const isFormEmpty = () => Object.values(formData).every((value) => value === '');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const cleanedValue = value.replace(',', '.');
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' && cleanedValue !== '' ? parseFloat(cleanedValue) : cleanedValue,
    }));
  };

  const submit = useCallback(() => {
    if (!isFormEmpty()) {
      setLoading(true);
      const payload = { ...formData };
      if (mode === 'duplicate') delete payload._id;

      const action =
        mode === 'edit'
          ? () => update(formData._id, formData)
          : () => {
              const basiPayload = basi
                .map(({ name, label }) => ({
                  name,
                  label,
                  valore: parseFloat(payload[name]) || 0,
                }))
                .filter((b) => b.valore > 0);
              const cleanedData = { ...payload };
              basi.forEach(({ name }) => delete cleanedData[name]);
              cleanedData.basi = basiPayload;
              cleanedData.hex = getHexFromPantone(payload.nomePantone);
              return create(cleanedData);
            };

      action()
        .then(() => {
          const key = mode === 'edit' ? 'editPantone' : mode === 'duplicate' ? 'duplicatePantone' : 'newPantone';
          closeModal(key);
          router.refresh();
        })
        .catch((err) => {
          setError('Errore durante il salvataggio');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [formData, mode, basi]);

  const reset = useCallback(() => {
    const iniziale = {};
    [...pantoneFieldsLeft, ...pantoneFieldsCenter, ...pantoneNotes, ...basi.map((b) => ({ form: 'input', type: 'number', name: b.name }))].forEach(
      (field) => {
        if (field.form === 'input' && field.type === 'number') {
          iniziale[field.name] = '';
        }
      }
    );
    setFormData(iniziale);
  }, [basi]);

  useEffect(() => {
    const handlerKey = mode === 'edit' ? 'editPantone' : mode === 'duplicate' ? 'duplicatePantone' : 'newPantone';
    registerHandler(handlerKey, { submit, reset });
  }, [registerHandler, submit, reset, mode]);

  useEffect(() => {
    if (mode !== 'new') return;
    const totale = Object.entries(formData)
      .filter(([key]) => basi.some((b) => b.name === key))
      .reduce((acc, [, val]) => acc + (Number(val) || 0), 0);
    const totaleArrotondato = Number(totale.toFixed(4));
    if (formData.dose !== totaleArrotondato) {
      setFormData((prev) => ({ ...prev, dose: totaleArrotondato }));
    }
  }, [formData, mode, basi]);

  // Raggruppa basi per nome e tipo
  const basiFiltrate =
    formData.tipo && formData.tipo !== 'Seleziona...'
      ? basi.filter((b) => {
          return b.tipo === formData.tipo && b.name;
        })
      : basi.filter((b) => b.name);

  const basiRaggruppate = basiFiltrate.reduce((acc, materiale) => {
    const key = `${materiale.name}_${materiale.tipo}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(materiale);
    return acc;
  }, {});

  return (
    <form>
      {loadingBasi ? (
        <Loader />
      ) : errorBasi ? (
        <p>{errorBasi}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-3 gap-2">
            <InputMap fields={pantoneFieldsLeft} formData={formData} handleChange={handleChange} mode={mode} />
            <InputMap fields={pantoneFieldsCenter} formData={formData} handleChange={handleChange} mode={mode} />
            <InputMap fields={pantoneNotes} formData={formData} handleChange={handleChange} mode={mode} />
          </div>
          <div className="flex flex-row items-center gap-5">
            <h2 className="text-2xl font-semibold mt-5">Composizione</h2>
            <span className="text-sm mt-5">Seleziona fornitore se necessario</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(basiRaggruppate).map(
              ([key, materiali]) =>
                materiali[0].name && (
                  <div key={key} className="flex flex-col">
                    <label>
                      {materiali[0].label} <span className="text-sm text-neutral-400 italic ml-2">{materiali[0].codiceColore}</span>
                    </label>
                    <input
                      type="number"
                      name={materiali[0].name}
                      value={formData[materiali[0].name] || ''}
                      onChange={handleChange}
                      placeholder="Quantità"
                    />
                    {materiali.length > 1 && formData.tipo && formData.tipo !== 'Seleziona...' && (
                      <>
                        <label>Seleziona fornitore</label>
                        <select
                          name={`${materiali[0].name}_fornitore`}
                          value={formData[`${materiali[0].name}_fornitore`] || ''}
                          onChange={handleChange}
                        >
                          <option value="">Seleziona...</option>
                          {materiali.map((mat) => (
                            <option key={mat.codiceFornitore} value={mat.codiceFornitore}>
                              {mat.fornitore} - ({mat.codiceColore})
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </form>
  );
}
