import { LayoutDashboard, Plus, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const vendorNav = [
  { to: '/vendor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/vendor/products/new', label: 'Add product', icon: Plus },
];

const vendorFooterNav = [
  { to: '/account', label: 'Customer account', icon: User, end: true },
];

export function VendorDashboardLayout() {
  return (
    <DashboardLayout
      title="Vendor"
      subtitle="Manage your store"
      nav={vendorNav}
      footerNav={vendorFooterNav}
    />
  );
}
