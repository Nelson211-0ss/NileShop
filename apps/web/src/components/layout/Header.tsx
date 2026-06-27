import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HeaderSearch } from '@/components/layout/HeaderSearch';

export function Header() {
  const user = useAppSelector((s) => s.auth.user);
  const cart = useAppSelector((s) => s.cart.cart);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="page-container relative flex h-16 items-center gap-3 sm:gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">N</span>
          <span className="hidden font-display font-bold text-primary sm:inline">NileShop</span>
        </Link>

        <HeaderSearch />

        <nav className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" asChild>
            <Link to="/wishlist"><Heart className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.item_count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {cart.item_count}
                </span>
              )}
            </Link>
          </Button>
          {user ? (
            <Button variant="ghost" asChild>
              <Link to="/account"><User className="mr-2 h-4 w-4" />{user.name.split(' ')[0]}</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth/login">Sign in</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-hidden="true">
            <Menu className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
