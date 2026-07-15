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
import { AppDashboardLayout } from '@/components/dashboard/AppDashboardLayout';

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
];

const adminFooterNav = [
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/account', label: 'Customer account', icon: User, end: true },
];

export function AdminDashboardLayout() {
  return <AppDashboardLayout title="Dashboard" nav={adminNav} footerNav={adminFooterNav} />;
}
