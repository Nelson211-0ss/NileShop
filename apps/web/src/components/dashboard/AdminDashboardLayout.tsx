import { LayoutDashboard, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
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
