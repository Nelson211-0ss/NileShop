import { Store, Truck, User } from 'lucide-react';
import { AppDashboardLayout } from '@/components/dashboard/AppDashboardLayout';

const riderNav = [{ to: '/rider', label: 'Deliveries', icon: Truck, end: true }];

const riderFooterNav = [
  { to: '/', label: 'Back to shop', icon: Store, end: true },
  { to: '/account', label: 'Customer account', icon: User, end: true },
];

export function RiderDashboardLayout() {
  return <AppDashboardLayout title="Rider Dashboard" nav={riderNav} footerNav={riderFooterNav} />;
}
