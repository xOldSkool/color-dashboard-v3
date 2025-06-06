'use client';
import { create } from 'zustand';
import { useTableStore } from './useTableStore';
import { Materiale } from '@/types/materialeTypes';
import { Pantone } from '@/types/pantoneTypes';

export type ModalKey =
  | 'newPantone'
  | 'editPantone'
  | 'deletePantone'
  | 'filterPantone'
  | 'selectColumns'
  | 'deliverPantone'
  | 'returnPantone'
  | 'producePantone'
  | 'destinationPantone'
  | 'transferPantone'
  | 'duplicatePantone'
  | 'removeFromToProduce'
  | 'newMateriale'
  | 'loadMateriale'
  | 'unloadMateriale'
  | 'editMateriale'
  | 'returnPantonePartial'
  | 'markPantoneAsConsumed'
  | 'exportToFile';

type Handler = {
  submit?: () => Promise<void | boolean>;
  reset?: () => void;
};

type ModalData =
  | Materiale
  | Pantone
  | string
  | null
  | { pantone: Pantone; quantita: number; onSuccess?: () => void }
  | { columns: string[]; rows: unknown[]; tableKey: string };

export interface ModalState {
  modals: Record<ModalKey, boolean>;
  submitHandlers: Record<ModalKey, () => Promise<boolean>>;
  resetHandlers: Record<ModalKey, () => void>;
  formValid: Record<ModalKey, boolean>;
  modalData: ModalData;
  setFormValid: (key: ModalKey, isValid: boolean) => void;
  openModal: (key: ModalKey, data?: ModalData) => void;
  closeModal: (key: ModalKey) => void;
  registerHandler: (key: ModalKey, handlers: Handler) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: {
    newPantone: false,
    editPantone: false,
    deletePantone: false,
    filterPantone: false,
    selectColumns: false,
    deliverPantone: false,
    returnPantone: false,
    producePantone: false,
    destinationPantone: false,
    transferPantone: false,
    duplicatePantone: false,
    removeFromToProduce: false,
    newMateriale: false,
    loadMateriale: false,
    unloadMateriale: false,
    editMateriale: false,
    returnPantonePartial: false,
    markPantoneAsConsumed: false,
    exportToFile: false,
  },
  submitHandlers: {} as Record<ModalKey, () => Promise<boolean>>,
  resetHandlers: {} as Record<ModalKey, () => void>,
  formValid: {} as Record<ModalKey, boolean>,
  modalData: null,
  openModal: (key, data) => {
    // Aggiorna la selezione solo se il dato è un Pantone o un Materiale
    if (data && typeof data === 'object') {
      if ('nomePantone' in data) {
        useTableStore.getState().setSelectedPantoni([data]);
      }
    }
    set((state) => ({ modals: { ...state.modals, [key]: true }, modalData: data ?? null }));
  },
  closeModal: (key) => {
    useTableStore.getState().clearAll();
    set((state) => ({ modals: { ...state.modals, [key]: false }, modalData: null }));
  },
  setFormValid: (key, isValid) => set((state) => ({ formValid: { ...state.formValid, [key]: isValid } })),
  registerHandler: (key, handlers) =>
    set((state) => {
      const wrappedSubmit = handlers.submit
        ? async () => {
            const success = await handlers.submit?.(); // ora ritorna boolean
            return success ?? false; // fallback
          }
        : async () => false; // se non definito, ritorna false

      return {
        submitHandlers: {
          ...state.submitHandlers,
          ...(wrappedSubmit && { [key]: wrappedSubmit }),
        },
        resetHandlers: {
          ...state.resetHandlers,
          ...(handlers.reset && { [key]: handlers.reset }),
        },
      };
    }),
}));
