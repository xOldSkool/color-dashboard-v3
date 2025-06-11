import React from 'react';
import InputMap from '@/components/InputMap';
import Loader from '@/components/Loader';
import { H3 } from '@/components/UI/Titles&Texts';
import { Field } from '@/types/constantsTypes';

export interface MaterialeFormLayoutProps {
  title: string;
  formData: Record<string, string | number | string[] | undefined>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  fieldList: Field[];
  errorMessage?: string | null;
  fieldErrors?: Record<string, string | undefined>;
  loading?: boolean;
  children?: React.ReactNode;
}

/**
 * Layout riutilizzabile per i form Materiali (nuovo, modifica, carico, scarico)
 * Gestisce header, errori, loading, mappatura campi e children custom.
 */
export default function MaterialeFormLayout({
  title,
  formData,
  handleChange,
  fieldList,
  errorMessage,
  fieldErrors = {},
  loading = false,
  children,
}: MaterialeFormLayoutProps) {
  return (
    <form className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      <H3>{title}</H3>
      {loading && <Loader />}
      {errorMessage && <div className="text-red-500 text-sm font-semibold border border-red-300 bg-red-50 rounded p-2">{errorMessage}</div>}
      <InputMap fields={fieldList} formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} />
      {children}
    </form>
  );
}
