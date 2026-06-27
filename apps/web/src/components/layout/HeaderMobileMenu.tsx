import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Heart,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react';
import type { User as AuthUser } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';

interface HeaderMobileMenuProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-muted text-foreground'
      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
  );

export function HeaderMobileMenu({ open, onClose, user }: HeaderMobileMenuProps) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col border-l border-border bg-background shadow-xl transition-transform duration-200 ease-out md:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <p className="font-display text-sm font-semibold">Menu</p>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavLink to="/products" className={linkClass} onClick={onClose}>
            <ShoppingBag className="h-4 w-4 shrink-0" />
            Browse products
          </NavLink>
          <NavLink to="/products?is_featured=1" className={linkClass} onClick={onClose}>
            <ShoppingBag className="h-4 w-4 shrink-0" />
            Featured deals
          </NavLink>
          <NavLink to="/cart" className={linkClass} onClick={onClose}>
            <ShoppingCart className="h-4 w-4 shrink-0" />
            Cart
          </NavLink>
          <NavLink to="/wishlist" className={linkClass} onClick={onClose}>
            <Heart className="h-4 w-4 shrink-0" />
            Wishlist
          </NavLink>

          {user ? (
            <>
              <NavLink to="/account" className={linkClass} onClick={onClose}>
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                My account
              </NavLink>
              <NavLink to="/orders" className={linkClass} onClick={onClose}>
                <Package className="h-4 w-4 shrink-0" />
                Orders
              </NavLink>
              <NavLink to="/messages" className={linkClass} onClick={onClose}>
                <MessageCircle className="h-4 w-4 shrink-0" />
                Messages
              </NavLink>
              {user.roles.includes('vendor') && (
                <NavLink to="/vendor" className={linkClass} onClick={onClose}>
                  <Store className="h-4 w-4 shrink-0" />
                  Vendor dashboard
                </NavLink>
              )}
              {user.roles.includes('delivery_rider') && (
                <NavLink to="/rider" className={linkClass} onClick={onClose}>
                  <Truck className="h-4 w-4 shrink-0" />
                  Rider dashboard
                </NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/auth/login" className={linkClass} onClick={onClose}>
                <User className="h-4 w-4 shrink-0" />
                Sign in
              </NavLink>
              <NavLink to="/auth/register" className={linkClass} onClick={onClose}>
                <User className="h-4 w-4 shrink-0" />
                Create account
              </NavLink>
            </>
          )}

          <NavLink to="/auth/vendor-register" className={linkClass} onClick={onClose}>
            <Store className="h-4 w-4 shrink-0" />
            Sell on NileShop
          </NavLink>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2">
            <span className="text-sm text-muted-foreground">Language</span>
            <LanguageSwitcher />
          </div>
          {user && (
            <p className="mt-2 truncate px-3 text-xs text-muted-foreground">Signed in as {user.name}</p>
          )}
          <Link
            to="/"
            className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            NileShop home
          </Link>
        </div>
      </aside>
    </>
  );
}
