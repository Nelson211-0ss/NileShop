import {
  Bell,
  Heart,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Package,
  Shield,
  Store,
  Truck,
  Wallet,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAppSelector } from '@/store/hooks';

const customerNav = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/addresses', label: 'Addresses', icon: MapPin },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

export function CustomerDashboardLayout() {
  const user = useAppSelector((s) => s.auth.user);

  const footerNav = [];
  if (user?.roles.includes('vendor')) {
    footerNav.push({ to: '/vendor', label: 'Vendor dashboard', icon: Store, end: true });
  }
  if (user?.roles.includes('administrator')) {
    footerNav.push({ to: '/admin', label: 'Admin panel', icon: Shield, end: true });
  }
  if (user?.roles.includes('delivery_rider')) {
    footerNav.push({ to: '/rider', label: 'Rider dashboard', icon: Truck, end: true });
  }

  return (
    <DashboardLayout
      title="My account"
      subtitle={user?.name}
      nav={customerNav}
      footerNav={footerNav.length > 0 ? footerNav : undefined}
    />
  );
}
