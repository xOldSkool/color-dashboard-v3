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
  formData: Record<string, string | number | undefined>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function InputMap({ fields, formData, handleChange }: InputMapProps): JSX.Element {
  return (
    <>
      {fields.map((field, index) => {
        const tag: 'input' | 'textarea' | 'select' | null =
          field.form === 'input' ? 'input' : field.form === 'textarea' ? 'textarea' : field.form === 'select' ? 'select' : null;

        if (!tag) return null;

        const commonProps = {
          type: field.form === 'input' ? field.type : undefined,
          name: field.name,
          required: field.required,
          value: formData[field.name] ?? '',
          onChange: handleChange,
          placeholder: field.placeholder || '0',
          rows: field.form === 'textarea' ? field.rows || undefined : undefined,
          disabled: field.name === 'dose',
          className: 'w-full p-2 rounded bg-zinc-600 text-white focus:outline-none',
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
            </div>
          );
        }

        return (
          <div key={index} className="flex flex-col items-start">
            {field.label && <label htmlFor={field.name}>{field.label}</label>}
            {createElement(tag, { id: field.name, ...commonProps })}
          </div>
        );
      })}
    </>
  );
}
