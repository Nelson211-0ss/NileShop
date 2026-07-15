import { useState, type FormEvent, type ReactNode, type SVGProps } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  CreditCard,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import nileshopIcon from '@/assets/logo/nileshop-icon.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold tracking-wide text-primary-foreground uppercase">{title}</h4>
      <ul className="space-y-2 text-sm text-primary-foreground/75">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className="transition-colors hover:text-primary-foreground">
        {children}
      </Link>
    </li>
  );
}

function NewsletterBlock() {
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !accepted) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-w-0 flex-1">
      <h3 className="text-xs font-bold tracking-wide text-primary-foreground uppercase">New to NileShop?</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
        Subscribe to our newsletter and get updates on deals, new vendors, and delivery in South Sudan.
      </p>
      {submitted ? (
        <p className="mt-4 text-sm text-primary-foreground">Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="flex items-start gap-2 text-xs text-primary-foreground/70">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 rounded border-primary-foreground/30"
            />
            <span>
              I accept the{' '}
              <Link to="/pages/terms" className="text-primary-foreground hover:underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link to="/pages/privacy" className="text-primary-foreground hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          <div className="flex max-w-md gap-0 overflow-hidden rounded-lg border border-primary-foreground/25 bg-primary-foreground/10">
            <div className="relative min-w-0 flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
              <Input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-none border-0 bg-transparent pl-10 text-primary-foreground placeholder:text-primary-foreground/45 focus-visible:ring-0"
              />
            </div>
            <Button
              type="submit"
              disabled={!accepted}
              className="h-11 shrink-0 rounded-none border-l border-primary-foreground/25 bg-primary-foreground px-5 text-primary hover:bg-primary-foreground/90"
            >
              Subscribe
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function AppDownloadBlock() {
  return (
    <div className="shrink-0 lg:w-72">
      <h3 className="text-xs font-bold tracking-wide text-primary-foreground uppercase">Download NileShop app</h3>
      <div className="mt-3 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10 p-2">
          <img src={nileshopIcon} alt="" className="h-full w-full object-contain" />
        </div>
        <p className="text-sm leading-snug text-primary-foreground/70">
          Get access to exclusive offers and track orders on the go.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-2 text-xs text-primary-foreground/85">
          <Smartphone className="h-4 w-4" />
          App Store — Soon
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-2 text-xs text-primary-foreground/85">
          <Smartphone className="h-4 w-4" />
          Google Play — Soon
        </span>
      </div>
    </div>
  );
}

const PAYMENT_METHODS: { label: string; icon: LucideIcon }[] = [
  { label: 'Cash on delivery', icon: Banknote },
  { label: 'Mobile money', icon: Smartphone },
  { label: 'Wallet', icon: Wallet },
  { label: 'Bank transfer', icon: Landmark },
  { label: 'Card', icon: CreditCard },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com', icon: FacebookIcon },
  { label: 'X (Twitter)', href: 'https://twitter.com', icon: XIcon },
  { label: 'Instagram', href: 'https://instagram.com', icon: InstagramIcon },
];

export function Footer() {
  return (
    <footer>
      {/* Top bar — brand blue: logo + newsletter + app */}
      <div className="border-b border-primary-foreground/15 bg-primary text-primary-foreground">
        <div className="page-container flex flex-col gap-8 py-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src={nileshopIcon} alt="" className="h-10 w-auto" />
            <span className="font-display text-2xl font-bold text-primary-foreground">NileShop</span>
          </Link>
          <NewsletterBlock />
          <AppDownloadBlock />
        </div>
      </div>

      {/* Everything else — deep blue */}
      <div className="bg-primary-dark text-primary-foreground">
        <div className="page-container py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <FooterColumn title="Need help?">
              <FooterLink to="/account">My account</FooterLink>
              <li>
                <a href="mailto:support@nileshop.ss" className="transition-colors hover:text-primary-foreground">
                  Contact support
                </a>
              </li>
              <FooterLink to="/orders">Track your order</FooterLink>
              <FooterLink to="/auth/login">Sign in / Register</FooterLink>
            </FooterColumn>

            <FooterColumn title="Useful links">
              <FooterLink to="/products">Browse all products</FooterLink>
              <FooterLink to="/products?is_featured=1">Featured deals</FooterLink>
              <FooterLink to="/cart">Shopping cart</FooterLink>
              <FooterLink to="/wishlist">Wishlist</FooterLink>
              <FooterLink to="/wallet">NileShop wallet</FooterLink>
            </FooterColumn>

            <FooterColumn title="About NileShop">
              <FooterLink to="/pages/about">About us</FooterLink>
              <FooterLink to="/auth/vendor-register">Sell on NileShop</FooterLink>
              <FooterLink to="/pages/terms">Terms & conditions</FooterLink>
              <FooterLink to="/pages/privacy">Privacy policy</FooterLink>
              <FooterLink to="/pages/returns">Returns & refunds</FooterLink>
            </FooterColumn>

            <FooterColumn title="Make money with us">
              <FooterLink to="/auth/vendor-register">Become a vendor</FooterLink>
              <FooterLink to="/vendor">Vendor dashboard</FooterLink>
              <li>
                <span className="text-primary-foreground/50">Delivery partners — coming soon</span>
              </li>
            </FooterColumn>

            <FooterColumn title="Shop by category">
              <FooterLink to="/products">All categories</FooterLink>
              <FooterLink to="/products?sort=total_sales&direction=desc">Best sellers</FooterLink>
              <FooterLink to="/products?sort=created_at&direction=desc">New arrivals</FooterLink>
              <FooterLink to="/products?sort=price&direction=asc">Lowest price</FooterLink>
            </FooterColumn>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10">
          <div className="page-container py-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h4 className="mb-3 text-xs font-bold tracking-wide text-primary-foreground uppercase">
                  Contact us
                </h4>
                <ul className="space-y-2 text-sm text-primary-foreground/75">
                  <li className="font-medium text-primary-foreground">NileShop Marketplace Ltd.</li>
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/50" />
                    Juba, South Sudan
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-primary-foreground/50" />
                    <a href="tel:+211900000000" className="hover:text-primary-foreground">
                      +211 900 000 000
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-primary-foreground/50" />
                    <a href="mailto:support@nileshop.ss" className="hover:text-primary-foreground">
                      support@nileshop.ss
                    </a>
                  </li>
                </ul>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold tracking-wide text-primary-foreground uppercase">
                    Follow us
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SOCIAL_LINKS.map((s) => {
                      const Icon = s.icon;
                      return (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground/80 transition-colors hover:border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-bold tracking-wide text-primary-foreground uppercase">
                  Payment methods
                </h4>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map(({ label, icon: Icon }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2 text-xs text-primary-foreground/85"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary-foreground/70" aria-hidden />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} NileShop. All prices in SSP. Made for South Sudan.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
