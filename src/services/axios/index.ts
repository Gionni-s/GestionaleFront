import { baseUrl } from '../../../config';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { store } from '../store';
import { logout, updateToken } from '../store/auth';

// Define interfaces for API responses
interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface User {
  // Define your user properties here
  id: string;
  [key: string]: any;
}

// HTTP request timeout in milliseconds
const REQUEST_TIMEOUT = 5000;

/**
 * Create a dedicated axios instance for token refresh operations
 * This instance doesn't use auth tokens to avoid circular dependencies
 */
export const axiosRefresh: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Main axios instance for API requests
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds auth token to all requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

/**
 * Refresh token API call
 * @param refreshToken - The refresh token to use
 * @returns Promise with the auth response
 */
const refreshTokenAPI = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await axiosRefresh.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    // Log refresh token errors for debugging
    console.error('Token refresh failed:', error);
    throw error;
  }
};

/**
 * Response interceptor - handles token refresh on 401 errors
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<any> => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle unauthorized errors by attempting to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          // No refresh token available, log the user out
          store.dispatch(logout());
          return Promise.reject(new Error('No refresh token available'));
        }

        // Attempt to get a new token
        const authData = await refreshTokenAPI(refreshToken);

        // Update auth state with new tokens
        store.dispatch(
          updateToken({
            token: authData.token,
            user: authData.user,
            refreshToken: authData.refreshToken,
          })
        );

        // Update the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${authData.token}`;
        }

        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If token refresh fails, log the user out
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // Special handling for 404 errors - might want to revisit this approach
    if (error.response?.status === 404) {
      console.warn('Resource not found:', originalRequest.url);
      return Promise.resolve(true); // Consider if this is the behavior you want
    }

    // Log all other API errors
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: originalRequest.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;
