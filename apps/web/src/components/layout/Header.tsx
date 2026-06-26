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
      <div className="page-container flex h-16 items-center gap-4">
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
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="page-container">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg mb-3">NileShop</h3>
            <p className="text-sm text-primary-foreground/80">South Sudan&apos;s premier multi-vendor marketplace. Shop local, pay securely.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?featured=1" className="hover:text-white transition-colors">Featured</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/wallet" className="hover:text-white transition-colors">Wallet</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Sell</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/auth/vendor-register" className="hover:text-white transition-colors">Become a Vendor</Link></li>
              <li><Link to="/vendor" className="hover:text-white transition-colors">Vendor Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-primary-foreground/70">© {new Date().getFullYear()} NileShop. Made for South Sudan.</p>
      </div>
    </footer>
  );
}
