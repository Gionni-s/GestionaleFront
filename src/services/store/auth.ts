import { UserProfile } from '@/app/Profile/components';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface User {
  id: string | undefined;
  email?: string;
  name?: string;
}

interface AuthState extends User {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
}

interface LoginPayload {
  id: string;
  email?: string;
  name?: string;
  token: string;
  refreshToken: string;
}

interface TokenUpdatePayload {
  token: string;
  user: UserProfile;
  refreshToken?: string;
}

const initialState: AuthState = {
  id: undefined,
  email: undefined,
  name: undefined,
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  loading: false,
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

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.isAuthenticated = true;
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      safeLocalStorage.setItem('token', action.payload.token);
      safeLocalStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    loginFailure: (state) => {
      state.loading = false;
    },
    logout: (state) => {
      Object.assign(state, initialState);
      safeLocalStorage.removeItem('token');
      safeLocalStorage.removeItem('refreshToken');
    },
    updateToken: (state, action: PayloadAction<TokenUpdatePayload>) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        safeLocalStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      safeLocalStorage.setItem('token', action.payload.token);
    },
    hydrate: (state) => {
      const token = safeLocalStorage.getItem('token');
      const refreshToken = safeLocalStorage.getItem('refreshToken');
      if (token && refreshToken) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateToken,
  hydrate,
} = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }): User => ({
  id: state.auth.id,
  email: state.auth.email,
  name: state.auth.name,
});
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthState = (state: { auth: AuthState }) => state.auth;
