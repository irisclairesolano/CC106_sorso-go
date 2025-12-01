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

// Individual selectors to prevent infinite re-renders
// Zustand functions are stable by default, but using individual selectors
// prevents components from re-rendering when unrelated store values change
export const useClearSelectedItems = () => useAdminStore((state) => state.clearSelectedItems)
export const useSyncSelectedItems = () => useAdminStore((state) => state.syncSelectedItems)
export const useSetSelectedItems = () => useAdminStore((state) => state.setSelectedItems)
export const useToggleSelectedItem = () => useAdminStore((state) => state.toggleSelectedItem)
export const useSetLoading = () => useAdminStore((state) => state.setLoading)
export const useSetError = () => useAdminStore((state) => state.setError)
export const useClearError = () => useAdminStore((state) => state.clearError)

// Value selectors
export const useSelectedItems = () => useAdminStore((state) => state.selectedItems)
export const useIsLoading = () => useAdminStore((state) => state.isLoading)
export const useError = () => useAdminStore((state) => state.error)
