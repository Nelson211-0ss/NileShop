import {
  BarChart3,
  Image,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
  { to: '/admin/locations', label: 'Locations', icon: MapPin },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/customers', label: 'Customers', icon: UserCheck },
  { to: '/admin/deliveries', label: 'Deliveries', icon: Truck },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const adminFooterNav = [
  { to: '/account', label: 'Customer account', icon: User, end: true },
];

export function AdminDashboardLayout() {
  return (
    <DashboardLayout
      title="Administration"
      subtitle="Platform management"
      nav={adminNav}
      footerNav={adminFooterNav}
    />
  );
}
