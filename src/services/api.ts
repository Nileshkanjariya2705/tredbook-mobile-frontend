import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cross-platform secure token storage helper
export const tokenStorage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Request Interceptor: Attach Access Token
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Transparent Unwrapper & Silent Refresh on 401
api.interceptors.response.use(
  (response) => {
    // Transparently unwrap production envelope { success: true, statusCode, message, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      response.data.success === true &&
      response.data.data !== undefined
    ) {
      const envelopeMessage = response.data.message;
      if (Array.isArray(response.data.data)) {
        response.data = response.data.data;
      } else if (typeof response.data.data === 'object' && response.data.data !== null) {
        response.data = {
          ...response.data.data,
          message: response.data.data.message || envelopeMessage,
        };
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await tokenStorage.get('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const access = res.data?.accessToken || res.data?.data?.accessToken;
          const refresh = res.data?.refreshToken || res.data?.data?.refreshToken;
          if (access) {
            await tokenStorage.set('access_token', access);
            if (refresh) {
              await tokenStorage.set('refresh_token', refresh);
              await tokenStorage.set('biometric_refresh_token', refresh);
            }
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          }
        } catch {
          // Refresh token invalid, clear tokens
          await tokenStorage.remove('access_token');
          await tokenStorage.remove('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  },
);
