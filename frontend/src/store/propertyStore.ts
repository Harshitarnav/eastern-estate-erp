import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
}

interface PropertyStore {
  // Selected property IDs
  selectedProperties: string[];
  
  // All available properties
  properties: Property[];
  
  // Loading state
  loading: boolean;
  
  // Multi-select mode (for admins)
  isMultiSelectMode: boolean;
  
  // Actions
  setSelectedProperties: (ids: string[]) => void;
  toggleProperty: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setProperties: (properties: Property[]) => void;
  setMultiSelectMode: (enabled: boolean) => void;
  
  // Computed
  getSelectedPropertyNames: () => string;
  hasAnySelected: () => boolean;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      selectedProperties: [],
      properties: [],
      loading: false,
      isMultiSelectMode: false,

      setSelectedProperties: (ids) => {
        const state = get();
        if (state.isMultiSelectMode) {
          set({ selectedProperties: ids });
        } else {
          // Single select mode - only keep the last one
          set({ selectedProperties: ids.slice(-1) });
        }
      },

      toggleProperty: (id) => {
        const state = get();
        const current = state.selectedProperties;
        
        console.log('[Store] toggleProperty called with id:', id);
        console.log('[Store] Current isMultiSelectMode:', state.isMultiSelectMode);
        console.log('[Store] Current selectedProperties:', current);
        
        if (state.isMultiSelectMode) {
          // Multi-select: toggle
          if (current.includes(id)) {
            console.log('[Store] Removing property from selection');
            set({ selectedProperties: current.filter(p => p !== id) });
          } else {
            console.log('[Store] Adding property to selection');
            set({ selectedProperties: [...current, id] });
          }
        } else {
          // Single select: replace
          console.log('[Store] Single-select mode: replacing selection');
          set({ selectedProperties: [id] });
        }
        
        console.log('[Store] New selectedProperties:', get().selectedProperties);
      },

      selectAll: () => {
        const state = get();
        if (state.isMultiSelectMode) {
          set({ selectedProperties: state.properties.map(p => p.id) });
        }
      },

      clearSelection: () => {
        // Allow empty selection to represent "All properties"
        set({ selectedProperties: [] });
      },

      setProperties: (properties) => set({ properties }),

      setMultiSelectMode: (enabled) => {
        set({ isMultiSelectMode: enabled });
        // If switching to single mode, keep only first selected
        if (!enabled) {
          const current = get().selectedProperties;
          if (current.length > 1) {
            set({ selectedProperties: current.slice(0, 1) });
          }
        }
      },

      getSelectedPropertyNames: () => {
        const state = get();
        const selected = state.properties.filter(p => 
          state.selectedProperties.includes(p.id)
        );
        
        if (selected.length === 0) return 'Select Property';
        if (selected.length === 1) return selected[0].name;
        if (selected.length === state.properties.length) return 'All Properties';
        return `${selected.length} Properties Selected`;
      },

      hasAnySelected: () => get().selectedProperties.length > 0,
    }),
    {
      name: 'property-filter-storage',
      partialize: (state) => ({
        selectedProperties: state.selectedProperties,
        isMultiSelectMode: state.isMultiSelectMode,
      }),
    }
  )
);
