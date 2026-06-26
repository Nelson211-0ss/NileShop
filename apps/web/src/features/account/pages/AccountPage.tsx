import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authApi } from '@/features/auth/api/authApi';
import { walletApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { logout } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function AccountPage() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: walletApi.get });

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
  };

  if (!user) return null;

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="rounded-2xl border border-border p-6 mb-6">
        <h2 className="font-semibold">{user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
        <p className="text-sm text-muted-foreground mt-1">Roles: {user.roles.join(', ')}</p>
      </div>

      {wallet?.data && (
        <div className="rounded-2xl border border-border p-6 mb-6 bg-primary/5">
          <p className="text-sm text-muted-foreground">Wallet Balance</p>
          <p className="text-3xl font-bold">{formatCurrency(wallet.data.balance)}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" asChild className="h-auto py-4"><Link to="/orders">My Orders</Link></Button>
        <Button variant="outline" asChild className="h-auto py-4"><Link to="/wishlist">Wishlist</Link></Button>
        <Button variant="outline" asChild className="h-auto py-4"><Link to="/addresses">Addresses</Link></Button>
        <Button variant="outline" asChild className="h-auto py-4"><Link to="/wallet">Wallet</Link></Button>
        {user.roles.includes('vendor') && (
          <Button variant="outline" asChild className="h-auto py-4"><Link to="/vendor">Vendor Dashboard</Link></Button>
        )}
        {user.roles.includes('administrator') && (
          <Button variant="outline" asChild className="h-auto py-4"><Link to="/admin">Admin Panel</Link></Button>
        )}
      </div>

      <Button variant="ghost" className="mt-6 text-destructive" onClick={handleLogout}>Sign out</Button>
    </div>
  );
}
