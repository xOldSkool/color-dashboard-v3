'use client';
import { Materiale } from '@/types/materialeTypes';
import { Pantone } from '@/types/pantoneTypes';
import { create } from 'zustand';

interface TableState {
  selectedRows: string[];
  selectedPantoni: Pantone[];
  selectedMateriali: Materiale[];
  searchQuery: string;
  visibleUserCols: string[]; // Non usato
  visibleUserColsMap: Record<string, string[]>;
  selectedTableKey: string | null;

  toggleSelection: (id: string) => void;
  setSelectedPantoni: (pantoni: Pantone[]) => void;
  setSelectedMateriali: (materiali: Materiale[]) => void;
  setSearchQuery: (value: string) => void;
  setVisibleUserCols: (tableKey: string, cols: string[]) => void;
  getVisibleUserCols: (tableKey: string) => string[];
  setSelectedTableKey: (key: string) => void;
  isSelected: (id: string) => boolean;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
}

export const useTableStore = create<TableState>((set, get) => ({
  selectedRows: [],
  selectedPantoni: [],
  selectedMateriali: [],
  searchQuery: '',
  visibleUserCols: [],
  visibleUserColsMap: {},
  selectedTableKey: null,
  toggleSelection: (id) => {
    const selected = get().selectedRows;
    set({
      selectedRows: selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id],
    });
  },
  setSelectedPantoni: (pantoni) => set({ selectedPantoni: pantoni }),
  setSelectedMateriali: (materiali) => set({ selectedMateriali: materiali }),
  setSearchQuery: (value) => set({ searchQuery: value }),
  setVisibleUserCols: (tableKey, cols) =>
    set((state) => ({
      visibleUserColsMap: { ...state.visibleUserColsMap, [tableKey]: cols },
    })),
  getVisibleUserCols: (tableKey) => get().visibleUserColsMap[tableKey] ?? [],
  setSelectedTableKey: (key) => set({ selectedTableKey: key }),
  isSelected: (id) => get().selectedRows.includes(id),
  selectAll: (ids) => set({ selectedRows: ids }),
  clearAll: () => set({ selectedRows: [] }),
}));
