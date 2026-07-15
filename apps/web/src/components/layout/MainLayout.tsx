import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

const NO_SITE_CHROME_PREFIXES = ['/vendor', '/admin', '/rider', '/auth/login', '/auth/register', '/auth/callback'];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function MainLayout() {
  const { pathname } = useLocation();
  const showSiteChrome = !matchesPrefix(pathname, NO_SITE_CHROME_PREFIXES);

  return (
    <div className={cn('flex min-h-screen flex-col', showSiteChrome && 'pb-16 md:pb-0')}>
      {showSiteChrome && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {showSiteChrome && <Footer />}
      {showSiteChrome && <BottomNav />}
    </div>
  );
}
