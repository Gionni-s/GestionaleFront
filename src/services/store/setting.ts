// store/settings.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  darkMode: boolean;
}

const initialState: SettingsState = {
  darkMode: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    settingsSave: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
    },
    settingsReset: (state) => {
      state.darkMode = initialState.darkMode;
    },
  },
});

export const { settingsSave, settingsReset } = settingsSlice.actions;
export default settingsSlice.reducer;

// Selector
export const selectThemeColor = (state: { settings: SettingsState }) =>
  state.settings.darkMode;
