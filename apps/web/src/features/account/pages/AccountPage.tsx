import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, Heart, MapPin, Package, Wallet } from 'lucide-react';
import { authApi } from '@/features/auth/api/authApi';
import { walletApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
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
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Wallet balance"
          value={wallet?.data ? formatCurrency(wallet.data.balance, wallet.data.currency) : '—'}
          icon={Wallet}
          hint="Use at checkout for instant payment"
        />
        <StatCard
          label="Account email"
          value={user.email}
          icon={Package}
          hint={`Roles: ${user.roles.join(', ')}`}
        />
      </div>

      <Card className="mb-6 rounded-xl shadow-none">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="mt-1 text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            <link.icon className="h-4 w-4 text-muted-foreground" />
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
