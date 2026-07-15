import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setStorageItem } from '@nileshop/utils';
import { authApi } from '@/features/auth/api/authApi';
import { dashboardPathForRoles } from '@/features/auth/utils/dashboardPath';
import { setCredentials } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

export function AuthCallbackPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('token');

    if (!token) {
      navigate('/auth/login?error=social_auth_failed', { replace: true });
      return;
    }

    setStorageItem('nileshop_token', token);

    authApi
      .me()
      .then((res) => {
        if (!res.data) throw new Error('Missing user in response');
        dispatch(setCredentials({ user: res.data, token }));
        navigate(dashboardPathForRoles(res.data.roles), { replace: true });
      })
      .catch(() => {
        navigate('/auth/login?error=social_auth_failed', { replace: true });
      });
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
