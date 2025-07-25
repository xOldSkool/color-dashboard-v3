'use client';
import { Field } from '@/types/constantsTypes';
import { ChangeEvent, createElement, JSX } from 'react';

// USO DEL COMPONENTE INPUTMAP:
// <InputMap
//   fields={inputs}      // Array di oggetti che definiscono i campi dinamici (può essere importato)
//   formData={formData}        // Oggetto contenente i valori correnti del form (es: { nome: '...', categoria: '...' })
//   handleChange={handleChange} // Funzione che gestisce il cambiamento di un campo (es: setFormData)
// />

interface InputMapProps {
  fields: Field[];
  formData: Record<string, string | number | undefined | string[]>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  fieldErrors?: Record<string, string | undefined>;
}

export default function InputMap({ fields, formData, handleChange, fieldErrors = {} }: InputMapProps): JSX.Element {
  return (
    <div>
      {fields.map((field, index) => {
        const tag: 'input' | 'textarea' | 'select' | null =
          field.form === 'input' ? 'input' : field.form === 'textarea' ? 'textarea' : field.form === 'select' ? 'select' : null;

        if (!tag) return null;

        // Gestione speciale per checkbox multipli (array)
        if (field.form === 'input' && field.type === 'checkbox' && 'options' in field && Array.isArray(field.options)) {
          const options = field.options;
          // selectedValues è sempre un array di stringhe, normalizzato a monte
          const selectedValues: string[] = Array.isArray(formData[field.name]) ? (formData[field.name] as string[]).map(String) : [];
          return (
            <div key={index} className="flex flex-col items-start">
              {field.label && <label>{field.label}</label>}
              <div className="flex gap-4">
                {options.map((opt) => (
                  <label key={opt} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name={field.name}
                      value={opt}
                      checked={selectedValues.includes(String(opt))}
                      onChange={(e) => {
                        // Gestione custom per checkbox multipli senza usare any
                        const checked = e.target.checked;
                        let newValues = [...selectedValues];
                        if (checked) {
                          if (!newValues.includes(opt)) newValues.push(opt);
                        } else {
                          newValues = newValues.filter((v) => v !== opt);
                        }
                        // Costruisci un event compatibile con handleChange ma typesafe
                        const event = {
                          target: {
                            name: field.name,
                            value: newValues,
                            type: 'checkbox',
                            checked: checked,
                          },
                        } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleChange(event);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {fieldErrors[field.name] && <p className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</p>}
            </div>
          );
        }

        const rawValue = formData[field.name];
        let displayValue: string | number = '';
        if (Array.isArray(rawValue)) {
          displayValue = '';
        } else if (rawValue !== undefined) {
          displayValue = rawValue;
        }
        if (field.name === 'dose' && typeof rawValue === 'number') {
          // Richiamo toFixed(3) SOLO se è davvero un number
          displayValue = rawValue.toFixed(3);
        }

        // Determina se il campo deve essere disabilitato (solo per input)
        const isDisabled =
          (field.form === 'input' && 'disabled' in field && field.disabled === true) || field.name === 'dose' || field.name === 'name';
        const commonProps = {
          type: field.form === 'input' ? field.type : undefined,
          name: field.name,
          required: field.required,
          value: displayValue,
          onChange: handleChange,
          placeholder: field.placeholder || '0',
          rows: field.form === 'textarea' ? field.rows || undefined : undefined,
          disabled: isDisabled,
          className:
            'w-full p-2 rounded bg-zinc-600 text-white focus:outline-none' +
            (isDisabled ? ' cursor-not-allowed' : '') +
            (fieldErrors[field.name] ? 'border border-1 border-[var(--error)]' : ''),
        };

        if (tag === 'select') {
          return (
            <div key={index} className="flex flex-col items-start">
              {field.label && <label htmlFor={field.name}>{field.label}</label>}
              <select key={index} id={field.name} {...commonProps}>
                {(field as { options: string[] }).options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors[field.name] && <p className="text-[var(--error)] text-xs mt-1">{fieldErrors[field.name]}</p>}
            </div>
          );
        }

        return (
          <div key={index} className="flex flex-col items-start">
            {field.label && <label htmlFor={field.name}>{field.label}</label>}
            {createElement(tag, { id: field.name, ...commonProps })}
            {fieldErrors[field.name] && <p className="text-[var(--error)] text-sm mt-1">{fieldErrors[field.name]}</p>}
          </div>
        );
      })}
    </div>
  );
}
