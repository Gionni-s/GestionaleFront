import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface Kpi {
  ids: string[];
}

const initialState: Kpi = {
  ids: [],
};

// Helper function for safe localStorage access
const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    budgetSave: (state, action: PayloadAction<Kpi>) => {
      state.ids = action.payload.ids;
      safeLocalStorage.setItem('kpiIds', JSON.stringify(state.ids));
    },
    budgetClear: (state) => {
      state.ids = [];
      safeLocalStorage.removeItem('kpiIds');
    },
    hydrate: (state) => {
      const ids = safeLocalStorage.getItem('kpiIds');
      if (ids) {
        state.ids = JSON.parse(ids);
      }
    },
  },
});

export const { budgetSave, budgetClear, hydrate } = kpiSlice.actions;
export default kpiSlice.reducer;

// Selectors
export const selectKpiIds = (state: { kpi: Kpi }) => state.kpi?.ids;
