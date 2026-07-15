import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

const NO_HEADER_PREFIXES = ['/auth/login', '/auth/register'];
const NO_FOOTER_PREFIXES = ['/vendor', '/admin', '/rider', '/auth/login', '/auth/register'];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function MainLayout() {
  const { pathname } = useLocation();
  const showHeader = !matchesPrefix(pathname, NO_HEADER_PREFIXES);
  const showFooterChrome = !matchesPrefix(pathname, NO_FOOTER_PREFIXES);

  return (
    <div className={cn('flex min-h-screen flex-col', showFooterChrome && 'pb-16 md:pb-0')}>
      {showHeader && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooterChrome && <Footer />}
      {showFooterChrome && <BottomNav />}
    </div>
  );
}
