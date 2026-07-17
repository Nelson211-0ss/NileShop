import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppTopbar } from '@/components/dashboard/AppTopbar';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
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
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={cn('flex min-h-screen bg-secondary/40', theme === 'dark' && 'dark')}>
      <AppSidebar nav={nav} footerNav={footerNav} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          title={title}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
