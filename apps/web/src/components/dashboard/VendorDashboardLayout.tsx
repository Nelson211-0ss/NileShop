import { LayoutDashboard, MessageCircle, Plus, ShoppingBag, Store, User } from 'lucide-react';
import { AppDashboardLayout } from '@/components/dashboard/AppDashboardLayout';

const vendorNav = [
  { to: '/vendor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/vendor/messages', label: 'Messages', icon: MessageCircle },
  { to: '/vendor/products/new', label: 'Add product', icon: Plus },
];

const vendorFooterNav = [
  { to: '/', label: 'Back to shop', icon: Store, end: true },
  { to: '/account', label: 'Customer account', icon: User, end: true },
];

export function VendorDashboardLayout() {
  return <AppDashboardLayout title="Vendor Dashboard" nav={vendorNav} footerNav={vendorFooterNav} />;
}
