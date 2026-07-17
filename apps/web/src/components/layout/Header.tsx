import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, MapPin, Menu, ShoppingCart, X } from 'lucide-react';
import nileshopIcon from '@/assets/logo/nileshop-icon.png';
import { catalogApi } from '@/lib/marketplaceApi';
import { useAppSelector } from '@/store/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HeaderSearch } from '@/components/layout/HeaderSearch';
import { HeaderMobileMenu } from '@/components/layout/HeaderMobileMenu';
import { HeaderAccountMenu } from '@/components/layout/HeaderAccountMenu';
import { HeaderCategoryMenu } from '@/components/layout/HeaderCategoryMenu';
import { HeaderNavDropdown, type NavDropdownItem } from '@/components/layout/HeaderNavDropdown';
import { cn } from '@/lib/utils';

type MobilePanel = 'menu' | 'search' | null;

type DropdownKind = 'categories' | 'best-sellers' | 'new-arrivals' | 'deals' | 'help' | 'sell';

type SubheaderItem =
  | { type: 'link'; to: string; label: string }
  | { type: 'dropdown'; to: string; label: string; kind: DropdownKind };

const SUBHEADER_ITEMS: SubheaderItem[] = [
  { type: 'dropdown', to: '/products', label: 'Shop', kind: 'categories' },
  { type: 'dropdown', to: '/products?is_featured=1', label: 'Featured Deals', kind: 'deals' },
  {
    type: 'dropdown',
    to: '/products?sort=total_sales&direction=desc',
    label: 'Best Sellers',
    kind: 'best-sellers',
  },
  {
    type: 'dropdown',
    to: '/products?sort=created_at&direction=desc',
    label: 'New Arrivals',
    kind: 'new-arrivals',
  },
  { type: 'link', to: '/guide', label: 'Guide' },
  { type: 'dropdown', to: '/help', label: 'Help', kind: 'help' },
  { type: 'link', to: '/advertise', label: 'Advertise' },
  { type: 'dropdown', to: '/auth/vendor-register', label: 'Sell on NileShop', kind: 'sell' },
];

const DEALS_ITEMS: NavDropdownItem[] = [
  { label: 'All featured deals', to: '/products?is_featured=1' },
  { label: 'Top rated deals', to: '/products?is_featured=1&sort=rating&direction=desc' },
  { label: 'Lowest price first', to: '/products?is_featured=1&sort=price&direction=asc' },
];

const HELP_ITEMS: NavDropdownItem[] = [
  { label: 'Orders & shipping', to: '/help#orders-shipping' },
  { label: 'Payments', to: '/help#payments' },
  { label: 'Returns & refunds', to: '/help#returns-refunds' },
  { label: 'Selling on NileShop', to: '/help#selling-on-nileshop' },
  { label: 'Account & security', to: '/help#account-security' },
  { label: 'Contact support', to: '/help#contact' },
];

const SELL_ITEMS: NavDropdownItem[] = [
  { label: 'Become a vendor', to: '/auth/vendor-register' },
  { label: 'How selling works', to: '/help#selling-on-nileshop' },
  { label: 'Vendor dashboard', to: '/vendor' },
];

function NavPill({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="group relative px-1 py-2 text-sm font-medium text-primary-foreground/85 transition-colors hover:text-primary-foreground"
    >
      {label}
      <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-200 ease-out group-hover:scale-x-100" />
    </Link>
  );
}

export function Header() {
  const user = useAppSelector((s) => s.auth.user);
  const cart = useAppSelector((s) => s.cart.cart);
  const location = useLocation();
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [scrolled, setScrolled] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.categories,
    staleTime: 5 * 60 * 1000,
  });
  const categories = useMemo(() => categoriesData?.data ?? [], [categoriesData]);

  const categoryItems = useMemo<NavDropdownItem[]>(
    () => categories.slice(0, 8).map((c) => ({ label: c.name, to: `/products?category_id=${c.id}` })),
    [categories],
  );
  const bestSellerItems = useMemo<NavDropdownItem[]>(
    () =>
      categories
        .slice(0, 8)
        .map((c) => ({ label: c.name, to: `/products?category_id=${c.id}&sort=total_sales&direction=desc` })),
    [categories],
  );
  const newArrivalItems = useMemo<NavDropdownItem[]>(
    () =>
      categories
        .slice(0, 8)
        .map((c) => ({ label: c.name, to: `/products?category_id=${c.id}&sort=created_at&direction=desc` })),
    [categories],
  );

  const dropdownItems: Record<DropdownKind, NavDropdownItem[]> = {
    categories: categoryItems,
    'best-sellers': bestSellerItems,
    'new-arrivals': newArrivalItems,
    deals: DEALS_ITEMS,
    help: HELP_ITEMS,
    sell: SELL_ITEMS,
  };

  const dropdownLoading: Record<DropdownKind, boolean> = {
    categories: categoriesLoading,
    'best-sellers': categoriesLoading,
    'new-arrivals': categoriesLoading,
    deals: false,
    help: false,
    sell: false,
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobilePanel(null);
  }, [location.pathname]);

  const closeMobilePanel = useCallback(() => setMobilePanel(null), []);

  const openMenu = () => {
    setMobilePanel((current) => (current === 'menu' ? null : 'menu'));
  };

  const openSearch = useCallback(() => setMobilePanel('search'), []);

  const itemCount = cart?.item_count ?? 0;

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('sticky top-0 z-50 transition-shadow duration-200', scrolled && 'shadow-lg')}
    >
      {/* Row 1 — brand, search, account */}
      <div className="bg-primary-dark">
        <div
          className={cn(
            'mx-auto flex w-full max-w-7xl items-center gap-2 px-4 transition-[padding] duration-200 sm:gap-3 sm:px-8 lg:px-10 xl:px-14',
            scrolled ? 'py-2' : 'py-2.5 sm:py-3',
          )}
        >
          {/* Expanded mobile search — replaces the whole row on mobile only */}
          <div
            className={cn(
              'min-w-0 flex-1 items-center md:hidden',
              mobilePanel === 'search' ? 'flex' : 'hidden',
            )}
          >
            <HeaderSearch
              variant="expanded"
              active={mobilePanel === 'search'}
              onClose={closeMobilePanel}
              className="w-full"
            />
          </div>

          {/* Normal header content — always visible at md+, hidden on mobile while search is expanded */}
          <div
            className={cn(
              'min-w-0 flex-1 items-center gap-2 sm:gap-3',
              mobilePanel === 'search' ? 'hidden md:flex' : 'flex',
            )}
          >
            <Link to="/" className="flex shrink-0 items-center gap-2 transition-transform hover:scale-[1.03]">
              <img src={nileshopIcon} alt="" className="h-8 w-auto sm:h-9" />
              <span className="max-w-[7rem] truncate font-display text-sm font-bold text-primary-foreground sm:max-w-none sm:text-base">
                NileShop
              </span>
            </Link>

            <Link
              to="/addresses"
              className="hidden shrink-0 items-start gap-1.5 rounded-md px-2 py-1.5 leading-tight transition-colors hover:bg-white/10 lg:flex"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
              <span className="flex flex-col">
                <span className="text-[11px] text-primary-foreground/70">Deliver to</span>
                <span className="text-sm font-semibold text-primary-foreground">Juba, South Sudan</span>
              </span>
            </Link>

            <div className="flex min-w-0 flex-1 items-center">
              <HeaderSearch variant="desktop" className="hidden w-full max-w-2xl md:block" />
              <HeaderSearch variant="trigger" onOpen={openSearch} className="w-full md:hidden" />
            </div>

            <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <LanguageSwitcher className="hidden text-primary-foreground hover:bg-white/10 md:inline-flex" />

              <Link
                to="/orders"
                className="hidden flex-col rounded-md px-2 py-1.5 leading-tight transition-colors hover:bg-white/10 lg:flex"
              >
                <span className="text-[11px] text-primary-foreground/70">Returns</span>
                <span className="text-sm font-semibold text-primary-foreground">&amp; Orders</span>
              </Link>

              <Link
                to="/wishlist"
                className="hidden flex-col items-center rounded-md px-2 py-1.5 leading-tight text-primary-foreground transition-colors hover:bg-white/10 md:flex"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                <span className="text-[11px] font-medium">List</span>
              </Link>

              <HeaderAccountMenu user={user} />

              <Link
                to="/cart"
                aria-label="Shopping cart"
                className="relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-primary-foreground transition-colors hover:bg-white/10"
              >
                <span className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white sm:h-5 sm:min-w-5 sm:text-xs"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </span>
                <span className="hidden text-sm font-semibold sm:inline">Cart</span>
              </Link>

              <button
                type="button"
                className="rounded-md p-2 text-primary-foreground transition-colors hover:bg-white/10 md:hidden"
                aria-label={mobilePanel === 'menu' ? 'Close menu' : 'Open menu'}
                aria-expanded={mobilePanel === 'menu'}
                onClick={openMenu}
              >
                {mobilePanel === 'menu' ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Row 2 — categories & quick links */}
      <div className="hidden bg-primary md:block">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-0.5 px-4 py-0.5 sm:px-8 lg:gap-x-5 lg:px-10 xl:px-14">
          <HeaderCategoryMenu />
          {SUBHEADER_ITEMS.map((item) =>
            item.type === 'dropdown' ? (
              <HeaderNavDropdown
                key={item.label}
                to={item.to}
                label={item.label}
                items={dropdownItems[item.kind]}
                loading={dropdownLoading[item.kind]}
                viewAllLabel={item.kind === 'categories' ? 'View all categories' : undefined}
              />
            ) : (
              <NavPill key={item.label} to={item.to} label={item.label} />
            ),
          )}
        </div>
      </div>

      <HeaderMobileMenu open={mobilePanel === 'menu'} onClose={closeMobilePanel} user={user} />
    </motion.header>
  );
}
