import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer } from '@/components/layout/Header';

const NO_FOOTER_PREFIXES = ['/vendor', '/admin', '/rider'];

function useShowFooter() {
  const { pathname } = useLocation();
  return !NO_FOOTER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function MainLayout() {
  const showFooter = useShowFooter();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
