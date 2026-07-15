import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, House, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const cart = useAppSelector((s) => s.cart.cart);
  const itemCount = cart?.item_count ?? 0;

  const items = [
    { to: '/', label: 'Home', icon: House, active: pathname === '/' },
    { to: '/products', label: 'Categories', icon: LayoutGrid, active: pathname.startsWith('/products') },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, active: pathname === '/cart', badge: itemCount },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, active: pathname === '/wishlist' },
    {
      to: user ? '/account' : '/auth/login',
      label: 'Account',
      icon: User,
      active: pathname === '/account' || pathname.startsWith('/auth'),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="relative flex flex-col items-center gap-1 py-2.5 active:scale-95"
          >
            {item.active && (
              <motion.span
                layoutId="bottomNavActiveBar"
                className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">
              <item.icon
                className={cn('h-6 w-6', item.active ? 'text-accent' : 'text-muted-foreground')}
                strokeWidth={item.active ? 2.25 : 1.9}
              />
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </span>
            <span
              className={cn(
                'text-[11px] font-medium',
                item.active ? 'text-accent' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
