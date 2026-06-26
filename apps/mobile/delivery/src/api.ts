import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888/api/v1';

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
};

export const riderApi = {
  deliveries: () => api.get('/rider/deliveries').then((r) => r.data),
  earnings: () => api.get('/rider/earnings').then((r) => r.data),
  location: (latitude: number, longitude: number) =>
    api.post('/rider/location', { latitude, longitude }),
  pickup: (uuid: string) => api.post(`/rider/deliveries/${uuid}/pickup`),
  complete: (uuid: string) => api.post(`/rider/deliveries/${uuid}/complete`),
};
