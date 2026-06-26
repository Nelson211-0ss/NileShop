import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('nileshop_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const homeApi = {
  get: () => api.get('/home').then((r) => r.data),
};

export const productApi = {
  list: () => api.get('/products').then((r) => r.data),
  get: (slug: string) => api.get(`/products/${slug}`).then((r) => r.data),
};

export const cartApi = {
  add: (product_id: number, quantity = 1) =>
    api.post('/cart/items', { product_id, quantity }).then((r) => r.data),
};
