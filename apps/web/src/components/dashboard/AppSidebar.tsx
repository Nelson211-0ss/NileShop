import { Link, NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import nileshopIcon from '@/assets/logo/nileshop-icon.png';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardNavItem } from '@/components/dashboard/types';

interface AppSidebarProps {
  nav: DashboardNavItem[];
  footerNav?: DashboardNavItem[];
  open: boolean;
  onClose: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-white shadow-sm shadow-accent/30'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );

export function AppSidebar({ nav, footerNav, open, onClose }: AppSidebarProps) {
  const sidebarContent = (
    <>
      <Link to="/" className="flex shrink-0 items-center gap-2 px-5 py-6">
        <img src={nileshopIcon} alt="" className="h-8 w-auto" />
        <span className="font-display text-lg font-bold text-foreground">NileShop</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={navLinkClass}>
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {footerNav && footerNav.length > 0 && (
        <div className="space-y-1 border-t border-border px-3 py-4">
          {footerNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={navLinkClass}>
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-end px-3 pt-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
