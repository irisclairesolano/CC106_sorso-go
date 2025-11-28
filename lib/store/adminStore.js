import { create } from "zustand"

export const useAdminStore = create((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  selectedItems: [],
  setSelectedItems: (items) => set({ selectedItems: items }),
  syncSelectedItems: (validIds) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((id) => validIds.includes(id)),
    })),
  toggleSelectedItem: (id) =>
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((itemId) => itemId !== id)
        : [...state.selectedItems, id],
    })),
  clearSelectedItems: () => set({ selectedItems: [] }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
