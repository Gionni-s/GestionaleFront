import { baseUrl } from '@/app/config';
import axios from 'axios';
import { store } from '../store';
import { logout, updateToken } from '../store/auth';

// Create refresh token instance without interceptors to prevent infinite loops
const axiosRefresh = axios.create({
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

// Add a request interceptor to dynamically add the token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to refresh token
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

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          // No refresh token available, logout user
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        const data = await refreshTokenAPI(refreshToken);

        // Update tokens in store
        store.dispatch(
          updateToken({
            token: data.token,
            refreshToken: data.refreshToken,
          })
        );

        // Update the failed request's token
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, logout user
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // Handle 404 Not Found (ignore the error and return null)
    if (error.response?.status === 404) {
      console.warn('Resource not found:', {
        url: error.config?.url,
      });
      return Promise.resolve(true);
    }

    // Handle other errors
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export { axiosInstance };
