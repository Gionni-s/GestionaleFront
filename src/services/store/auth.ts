import { UserProfile } from '@/app/Profile/components';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface User {
  id: string | undefined;
  email?: string;
  name?: string;
  surname?: string;
  role?: string;
  profileImage?: string | null;
}

interface AuthState extends User {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
}

interface LoginPayload {
  token: string;
  user: {
    id: string;
    email?: string;
    name?: string;
    surname?: string;
    role: string;
    profileImage?: string | null;
  };
  refreshToken?: string;
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
  surname: undefined,
  role: undefined,
  profileImage: undefined,
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
      const { token, user, refreshToken } = action.payload;

      state.isAuthenticated = true;
      state.id = user.id;
      state.email = user.email;
      state.name = user.name;
      state.surname = user.surname;
      state.role = user.role;
      state.profileImage = user.profileImage;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.loading = false;

      safeLocalStorage.setItem('token', token);
      safeLocalStorage.setItem('role', user.role);
      safeLocalStorage.setItem('email', user.email || '');
      safeLocalStorage.setItem('name', user.name || '');
      safeLocalStorage.setItem('surname', user.surname || '');
      if (refreshToken) {
        safeLocalStorage.setItem('refreshToken', refreshToken);
      }
    },
    loginFailure: (state) => {
      state.loading = false;
    },
    logout: (state) => {
      Object.assign(state, initialState);
      safeLocalStorage.removeItem('token');
      safeLocalStorage.removeItem('refreshToken');
      safeLocalStorage.removeItem('role');
      safeLocalStorage.removeItem('email');
      safeLocalStorage.removeItem('name');
      safeLocalStorage.removeItem('surname');
    },
    updateToken: (state, action: PayloadAction<TokenUpdatePayload>) => {
      const { token, user, refreshToken } = action.payload;

      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken;
      state.id = user._id;
      state.email = user.email;
      state.name = user.name;
      state.surname = user.surname;
      state.role = user.role;
      state.profileImage = user.profileImage;

      safeLocalStorage.setItem('token', token);
      if (refreshToken) {
        safeLocalStorage.setItem('refreshToken', refreshToken);
      }
      safeLocalStorage.setItem('role', user.role);
      safeLocalStorage.setItem('email', user.email || '');
      safeLocalStorage.setItem('name', user.name || '');
      safeLocalStorage.setItem('surname', user.surname || '');
    },
    hydrate: (state) => {
      const token = safeLocalStorage.getItem('token');
      const refreshToken = safeLocalStorage.getItem('refreshToken');
      const role = safeLocalStorage.getItem('role');
      const email = safeLocalStorage.getItem('email');
      const name = safeLocalStorage.getItem('name');
      const surname = safeLocalStorage.getItem('surname');

      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }
      if (role) {
        state.role = role;
      }
      if (email) {
        state.email = email;
      }
      if (name) {
        state.name = name;
      }
      if (surname) {
        state.surname = surname;
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
  surname: state.auth.surname,
  role: state.auth.role,
  profileImage: state.auth.profileImage,
});
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthState = (state: { auth: AuthState }) => state.auth;
