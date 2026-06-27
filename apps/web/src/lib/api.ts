import axios from 'axios';
import { getStorageItem, removeStorageItem } from '@nileshop/utils';
import { getOrCreateCartSessionId } from '@/lib/cartSession';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStorageItem('nileshop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Cart-Session'] = getOrCreateCartSessionId();

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeStorageItem('nileshop_token');
      const path = window.location.pathname;
      const isPublicPath =
        path.startsWith('/auth') ||
        path === '/cart' ||
        path.startsWith('/products') ||
        path === '/';
      if (!isPublicPath) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);
