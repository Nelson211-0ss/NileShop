import { Truck, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const riderNav = [
  { to: '/rider', label: 'Deliveries', icon: Truck, end: true },
];

const riderFooterNav = [
  { to: '/account', label: 'Customer account', icon: User, end: true },
];

export function RiderDashboardLayout() {
  return (
    <DashboardLayout
      title="Rider"
      subtitle="Delivery operations"
      nav={riderNav}
      footerNav={riderFooterNav}
    />
  );
}
