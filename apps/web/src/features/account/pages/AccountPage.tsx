import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, Heart, MapPin, Package, Wallet } from 'lucide-react';
import { authApi } from '@/features/auth/api/authApi';
import { walletApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { logout } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const quickLinks = [
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/addresses', label: 'Addresses', icon: MapPin },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

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
    <>
      <PageHeader
        title="Overview"
        description="Manage your profile, orders, and account settings."
        actions={
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        }
      />

      <div className="mb-8 space-y-1">
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {wallet?.data && (
          <p className="pt-2 text-sm">
            Wallet: <span className="font-semibold">{formatCurrency(wallet.data.balance, wallet.data.currency)}</span>
          </p>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
