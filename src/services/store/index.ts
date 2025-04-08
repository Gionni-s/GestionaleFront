import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './auth';
import kpiReducer from './kpi';
import languageReducer from './language';
import logger from 'redux-logger';
import settingReducer from './setting';

const persistConfig = {
  key: 'root',
  storage,
};


const rootReducer = combineReducers({
  auth: authReducer,
  kpi: kpiReducer,
  language: languageReducer,
  settings: settingReducer,
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(logger),
});

export const persistor = persistStore(store);
