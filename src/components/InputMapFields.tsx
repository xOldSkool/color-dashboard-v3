import { createElement } from 'react';

// USO DEL COMPONENTE INPUTMAP:
// <InputMap
//   fields={inputs}      // Array di oggetti che definiscono i campi dinamici (può essere importato)
//   formData={formData}        // Oggetto contenente i valori correnti del form (es: { nome: '...', categoria: '...' })
//   handleChange={handleChange} // Funzione che gestisce il cambiamento di un campo (es: setFormData)
//   mode={mode}                // Stringa che indica la modalità del form ('new' o 'edit')
// />

export default function InputMap({ fields, formData, handleChange, mode }) {
  return (
    <>
      {fields.map((field, index) => {
        let tag =
          field.form === 'input'
            ? 'input'
            : field.form === 'textarea'
              ? 'textarea'
              : field.form === 'select'
                ? 'select'
                : null;

        if (!tag) return null;

        const commonProps = {
          type: field.type,
          name: field.name,
          required: field.required,
          value: formData[field.name] ?? '',
          onChange: handleChange,
          placeholder: field.placeholder || '0',
          rows: field.rows || null,
          disabled: mode === 'new' && field.name === 'dose',
          className:
            'w-full p-2 rounded bg-zinc-600 text-white focus:outline-none',
        };

        if (tag === 'select') {
          return (
            <div key={index} className="flex flex-col items-start">
              {field.label && <label htmlFor={field.name}>{field.label}</label>}
              <select key={index} id={field.name} {...commonProps}>
                {field.options.map((opt, i) => (
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
