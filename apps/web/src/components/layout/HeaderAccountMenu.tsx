import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, LogOut, Package, Store, User, Wallet } from 'lucide-react';
import type { User as AuthUser } from '@nileshop/types';
import { authApi } from '@/features/auth/api/authApi';
import { logout } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { cn } from '@/lib/utils';

const menuItemClass =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted';

export function HeaderAccountMenu({ user }: { user: AuthUser | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await authApi.logout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 leading-tight transition-colors hover:bg-white/10"
      >
        <span className="flex flex-col items-start">
          <span className="text-[11px] text-primary-foreground/70">
            {user ? `Hello, ${user.name.split(' ')[0]}` : 'Hello, sign in'}
          </span>
          <span className="text-sm font-semibold text-primary-foreground">Account &amp; Lists</span>
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-primary-foreground/70 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-xl border border-border bg-card p-2 shadow-xl"
          >
            {user ? (
              <>
                <Link to="/account" className={menuItemClass} onClick={() => setOpen(false)}>
                  <User className="h-4 w-4 text-muted-foreground" /> My account
                </Link>
                <Link to="/orders" className={menuItemClass} onClick={() => setOpen(false)}>
                  <Package className="h-4 w-4 text-muted-foreground" /> Orders
                </Link>
                <Link to="/wishlist" className={menuItemClass} onClick={() => setOpen(false)}>
                  <Heart className="h-4 w-4 text-muted-foreground" /> Wishlist
                </Link>
                <Link to="/wallet" className={menuItemClass} onClick={() => setOpen(false)}>
                  <Wallet className="h-4 w-4 text-muted-foreground" /> Wallet
                </Link>
                {user.roles.includes('vendor') && (
                  <Link to="/vendor" className={menuItemClass} onClick={() => setOpen(false)}>
                    <Store className="h-4 w-4 text-muted-foreground" /> Vendor dashboard
                  </Link>
                )}
                <div className="my-1 border-t border-border" />
                <button type="button" onClick={handleLogout} className={cn(menuItemClass, 'w-full text-left')}>
                  <LogOut className="h-4 w-4 text-muted-foreground" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className={menuItemClass} onClick={() => setOpen(false)}>
                  <User className="h-4 w-4 text-muted-foreground" /> Sign in
                </Link>
                <Link to="/auth/register" className={menuItemClass} onClick={() => setOpen(false)}>
                  <User className="h-4 w-4 text-muted-foreground" /> Create account
                </Link>
                <div className="my-1 border-t border-border" />
                <Link to="/auth/vendor-register" className={menuItemClass} onClick={() => setOpen(false)}>
                  <Store className="h-4 w-4 text-muted-foreground" /> Sell on NileShop
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
