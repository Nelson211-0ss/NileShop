import { useEffect } from 'react';
import { useCartActions } from '@/hooks/useCart';
import { useAppSelector } from '@/store/hooks';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { syncCart } = useCartActions();

  useEffect(() => {
    syncCart().catch(() => undefined);
  }, [isAuthenticated, syncCart]);

  return <>{children}</>;
}
