import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppTopbar } from '@/components/dashboard/AppTopbar';
import { useAppSelector } from '@/store/hooks';
import type { DashboardNavItem } from '@/components/dashboard/types';

interface AppDashboardLayoutProps {
  title: string;
  nav: DashboardNavItem[];
  footerNav?: DashboardNavItem[];
}

export function AppDashboardLayout({ title, nav, footerNav }: AppDashboardLayoutProps) {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <AppSidebar nav={nav} footerNav={footerNav} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar title={title} user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
