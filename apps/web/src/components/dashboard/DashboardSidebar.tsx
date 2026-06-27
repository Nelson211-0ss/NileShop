import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardNavItem } from '@/components/dashboard/types';

interface DashboardSidebarProps {
  title: string;
  subtitle?: string;
  nav: DashboardNavItem[];
  footerNav?: DashboardNavItem[];
}

export function DashboardSidebar({ title, subtitle, nav, footerNav }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="border-b border-border px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dashboard</p>
        <p className="mt-1 font-semibold">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {footerNav && footerNav.length > 0 && (
        <div className="space-y-1 border-t border-border p-3">
          {footerNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Menu className="mr-2 h-4 w-4" />
          Menu
        </Button>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back to shop
        </Link>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 lg:rounded-xl lg:border lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-end border-b border-border p-2 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
