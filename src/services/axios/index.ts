import { baseUrl } from '../../../config';
import axios from 'axios';
import { store } from '../store';
import { logout, updateToken } from '../store/auth';

export const axiosRefresh = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const refreshTokenAPI = async (refreshToken: string) => {
  try {
    const response = await axiosRefresh.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔸 Caso 401: Token scaduto
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const data = await refreshTokenAPI(refreshToken);

        store.dispatch(
          updateToken({
            token: data.token,
            user: data.user,
            refreshToken: data.refreshToken,
          })
        );

        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
      return Promise.resolve(true);
    }

    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;
