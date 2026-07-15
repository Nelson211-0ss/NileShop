import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Menu, Package, Store, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { catalogApi } from '@/lib/marketplaceApi';
import { resolveCategoryIcon } from '@/lib/categoryIcon';
import { cn } from '@/lib/utils';

const QUICK_LINKS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/auth/vendor-register', label: 'Sell on NileShop', icon: Store },
  { to: '/orders', label: 'Track your order', icon: Package },
  { to: '/wallet', label: 'NileShop wallet', icon: Wallet },
];

export function HeaderCategoryMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.categories,
    staleTime: 5 * 60 * 1000,
  });
  const categories = data?.data ?? [];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/10',
          open && 'bg-white/10',
        )}
      >
        <Menu className="h-4 w-4" />
        All
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-xl sm:w-80"
          >
            <div className="bg-primary-dark px-5 py-4">
              <p className="text-lg font-bold text-primary-foreground">Shop by Category</p>
            </div>

            <ul className="max-h-80 overflow-y-auto py-1">
              {categories.length === 0 && (
                <li className="px-5 py-3 text-sm text-muted-foreground">Loading categories…</li>
              )}
              {categories.map((cat, i) => {
                const Icon = resolveCategoryIcon(cat.icon);
                return (
                  <motion.li
                    key={cat.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.02 }}
                  >
                    <Link
                      to={`/products?category_id=${cat.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                        <span className="text-[15px] font-medium text-foreground">{cat.name}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            <div className="border-t border-border" />

            <div className="px-5 pb-1 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground/80">
                More from NileShop
              </p>
            </div>
            <ul className="py-1">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted"
                  >
                    <link.icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                    <span className="text-[15px] font-medium text-foreground">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-border p-2">
              <Link
                to="/products"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-muted"
              >
                Browse all products
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
