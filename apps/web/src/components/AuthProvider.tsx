import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authApi } from '@/features/auth/api/authApi';
import { setUser, logout } from '@/store/authSlice';
import { getStorageItem } from '@nileshop/utils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const token = getStorageItem('nileshop_token');
    if (token && !isAuthenticated) {
      authApi.me()
        .then((res) => { if (res.data) dispatch(setUser(res.data)); })
        .catch(() => dispatch(logout()));
    }
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
}
