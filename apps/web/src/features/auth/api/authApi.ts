import type { AuthTokenResponse, LoginCredentials, RegisterCredentials } from '@nileshop/types';
import type { ApiResponse } from '@nileshop/types';
import { api } from '@/lib/api';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<ApiResponse<AuthTokenResponse>>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials) => {
    const { data } = await api.post<ApiResponse<AuthTokenResponse>>('/auth/register', credentials);
    return data;
  },

  logout: async () => {
    const { data } = await api.post<ApiResponse<null>>('/auth/logout');
    return data;
  },

  me: async () => {
    const { data } = await api.get<ApiResponse<import('@nileshop/types').User>>('/auth/me');
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return data;
  },
};
