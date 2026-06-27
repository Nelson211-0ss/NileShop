import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import type { DashboardNavItem } from '@/components/dashboard/types';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  nav: DashboardNavItem[];
  footerNav?: DashboardNavItem[];
}

export function DashboardLayout({ title, subtitle, nav, footerNav }: DashboardLayoutProps) {
  return (
    <div className="page-container py-6 lg:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <DashboardSidebar title={title} subtitle={subtitle} nav={nav} footerNav={footerNav} />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
