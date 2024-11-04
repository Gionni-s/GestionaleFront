import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import tokenReducer from "./token"
import logReducer from "./log"
import logger from "redux-logger"

const persistConfig = {
  key: "root",
  storage,
}

const rootReducer = combineReducers({
  token: tokenReducer, // Rename for clarity
  log: logReducer, // Rename for clarity
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(logger),
})

export const persistor = persistStore(store)
