import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface Language {
  code: string;
  name: string;
  flag: string;
}

const initialState: Language = {
  code: 'en',
  name: 'English',
  flag: 'img/flag/UK.png',
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    languageSave: (state, action: PayloadAction<Language>) => {
      state.code = action.payload.code;
      state.name = action.payload.name;
      state.flag = action.payload.flag;
    },
    languageClear: (state) => {
      state.code = initialState.code;
      state.name = initialState.name;
      state.flag = initialState.flag;
    },
  },
});

export const { languageSave, languageClear } = languageSlice.actions;
export default languageSlice.reducer;

// Selectors
export const selectLanguageCode = (state: { language: Language }) =>
  state.language?.code;
