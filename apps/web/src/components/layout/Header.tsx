import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HeaderSearch } from '@/components/layout/HeaderSearch';
import { HeaderMobileMenu } from '@/components/layout/HeaderMobileMenu';

type MobilePanel = 'menu' | 'search' | null;

export function Header() {
  const user = useAppSelector((s) => s.auth.user);
  const cart = useAppSelector((s) => s.cart.cart);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

  const closeMobilePanel = useCallback(() => setMobilePanel(null), []);

  const openMenu = () => {
    setMobilePanel((current) => (current === 'menu' ? null : 'menu'));
  };

  const handleSearchOpenChange = useCallback((open: boolean) => {
    setMobilePanel(open ? 'search' : null);
  }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:h-16 sm:gap-3 sm:px-8 lg:px-10 xl:px-14">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground sm:h-9 sm:w-9">
            N
          </span>
          <span className="max-w-[7rem] truncate font-display text-sm font-bold text-primary sm:max-w-none sm:text-base">
            NileShop
          </span>
        </Link>

        <HeaderSearch
          className="flex min-w-0 flex-1 items-center"
          mobileOpen={mobilePanel === 'search'}
          onMobileOpenChange={handleSearchOpenChange}
        />

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div className="hidden items-center gap-0.5 md:flex lg:gap-1">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" asChild>
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart" aria-label="Shopping cart">
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.item_count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white sm:h-5 sm:min-w-5 sm:text-xs">
                  {cart.item_count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/account">
                <User className="mr-2 h-4 w-4" />
                <span className="max-w-[6rem] truncate lg:max-w-none">{user.name.split(' ')[0]}</span>
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link to="/auth/login">Sign in</Link>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobilePanel === 'menu' ? 'Close menu' : 'Open menu'}
            aria-expanded={mobilePanel === 'menu'}
            onClick={openMenu}
          >
            {mobilePanel === 'menu' ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>
      </div>

      <HeaderMobileMenu open={mobilePanel === 'menu'} onClose={closeMobilePanel} user={user} />
    </header>
  );
}
