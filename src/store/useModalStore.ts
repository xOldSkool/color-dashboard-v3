'use client';
import { create } from 'zustand';
import { useTableStore } from './useTableStore';

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
  | 'returnPantoneDecisione'
  | 'newMateriale'
  | 'loadMateriale'
  | 'unloadMateriale';

type Handler = {
  submit?: () => Promise<void>;
  reset?: () => void;
};

export interface ModalState {
  modals: Record<ModalKey, boolean>;
  submitHandlers: Record<ModalKey, () => Promise<void>>;
  resetHandlers: Record<ModalKey, () => void>;
  openModal: (key: ModalKey) => void;
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
    returnPantoneDecisione: false,
    newMateriale: false,
    loadMateriale: false,
    unloadMateriale: false,
  },
  submitHandlers: {} as Record<ModalKey, () => Promise<void>>,
  resetHandlers: {} as Record<ModalKey, () => void>,

  openModal: (key) => set((state) => ({ modals: { ...state.modals, [key]: true } })),
  closeModal: (key) => {
    useTableStore.getState().clearAll();
    set((state) => ({ modals: { ...state.modals, [key]: false } }));
  },
  registerHandler: (key, handlers) =>
    set((state) => {
      const wrappedSubmit = handlers.submit
        ? async () => {
            await handlers.submit?.();
            useTableStore.getState().clearAll();
          }
        : undefined;

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
