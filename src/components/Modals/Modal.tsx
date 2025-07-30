'use client';
import { X } from 'lucide-react';
import Button from '../Button';
import { ModalKey, useModalStore } from '@/store/useModalStore';
import { ReactNode, useState } from 'react';
import { H3 } from '../UI/Titles&Texts';

interface ModalProps {
  title: string;
  modalKey: ModalKey;
  onClose: () => void;
  children: ReactNode;
  showFooter?: boolean;
}

// USO DEL COMPONENTE MODAL:
// <Modal
//   title="Titolo modale"                titolo visualizzato nell'header
//   modalKey="modalIdentifier"           chiave univoca (tipo ModalKey) per identificare la modale nello store
//   onClose={() => closeModal('id')}     funzione di chiusura della modale (es. dispatch closeModal)
//   showFooter={true}                    mostra o nasconde il footer con i pulsanti (default: true)
// >
//   Contenuto della modale               contenuto dinamico da mostrare (es. testo, form, ecc.)
// </Modal>

export default function Modal({ title, modalKey, onClose, children, showFooter = true }: ModalProps) {
  const submitHandlers = useModalStore((state) => state.submitHandlers);
  const resetHandlers = useModalStore((state) => state.resetHandlers);
  const isFormValid = useModalStore((state) => state.formValid[modalKey] ?? true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleConfirm = async () => {
    setSubmitLoading(true);
    const success = await submitHandlers[modalKey]?.(); // aspetta il risultato
    setSubmitLoading(false);
    if (success) {
      onClose(); // chiude la modale solo se submit ha successo
    }
  };

  const handleReset = () => {
    resetHandlers[modalKey]?.();
  };

  return (
    <>
      {/* overlay nero con opacità 50%. Se premuto -> onClose(setIsOpen = false) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground-50)]" onClick={onClose}>
        {/* corpo della modale */}
        <div
          className="bg-[var(--background)] rounded-2xl shadow-xl min-w-fit max-w-5xl max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none scrollbar-thumb-gray-500 scrollbar-track-gray-800"
          onClick={(e) => e.stopPropagation()} // blocca click interno
        >
          {/* header della modale */}
          <div className="flex items-center justify-between border-b-1 border-dashed border-[var(--border)]">
            {/* titolo */}
            <H3 className="m-4 mt-5">{title}</H3>
            {/* bottone di chiusura */}
            <button
              onClick={onClose} // click sulla X = chiusura
              className="text-[var(--text)] hover:text-[var(--accent)] cursor-pointer mr-4"
            >
              <X />
            </button>
          </div>

          {/* contenuto della modale */}
          <div className="p-5 overflow-y-auto">{children}</div>

          {/* footer della modale */}
          {showFooter && (
            <div className="flex justify-between p-5 border-t-1 border-dashed border-[var(--border)]">
              <div>
                <Button onClick={handleReset} variant="ghost" className="hover:bg-[var(--danger)] hover:text-white">
                  Reset
                </Button>
              </div>
              <div className="flex flex-row space-x-2">
                <Button onClick={onClose} variant="ghost" className="hover:bg-[var(--danger)] hover:text-white">
                  Annulla
                </Button>
                <Button onClick={handleConfirm} variant="primary" disabled={!isFormValid || submitLoading} isLoading={submitLoading}>
                  Conferma
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Clicco bottone
// ↓
// dispatch(openModal(defaultBtn))
// ↓
// Button.jsx vede che openModal === defaultBtn
// ↓
// Renderizza ActionComponent (es. NewPantone)
// ↓
// NewPantone passa onClose a Modal
// ↓
// Modal chiama onClose su click "Annulla" o "Conferma"
// ↓
// dispatch(closeModal())
// ↓
// Stato Redux aggiornato, modale chiusa
