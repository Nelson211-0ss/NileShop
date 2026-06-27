import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Landmark,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Tag,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { addressApi, cartApi, couponApi, orderApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import type { Address, PaymentGateway } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartActions } from '@/hooks/useCart';
import { extractApiError } from '@/lib/apiErrors';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS: {
  id: PaymentGateway;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  { id: 'cash_on_delivery', label: 'Cash on delivery', description: 'Pay when your order arrives', icon: Banknote },
  { id: 'mobile_money', label: 'Mobile money', description: 'MTN or Zain mobile payment', icon: Smartphone },
  { id: 'bank_transfer', label: 'Bank transfer', description: 'Pay via bank with order reference', icon: Landmark },
  { id: 'wallet', label: 'NileShop wallet', description: 'Instant payment from your balance', icon: Wallet },
  { id: 'card', label: 'Debit / credit card', description: 'Secure card payment', icon: CreditCard },
];

function CheckoutSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-24">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {step}
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </section>
  );
}

function SelectableCard({
  selected,
  onSelect,
  children,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-colors',
        selected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:bg-muted/40',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { resetCart } = useCartActions();
  const addressInitialized = useRef(false);

  const [gateway, setGateway] = useState<PaymentGateway>('cash_on_delivery');
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    city: 'Juba',
    country: 'South Sudan',
  });

  const { data: cartData, isLoading: cartLoading } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const { data: addressData } = useQuery({ queryKey: ['addresses'], queryFn: addressApi.list });
  const cart = cartData?.data;
  const addresses = addressData?.data ?? [];

  const selectedAddress =
    selectedAddressId !== 'new' ? addresses.find((a) => a.id === selectedAddressId) : undefined;

  useEffect(() => {
    if (!addressInitialized.current && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
      setSelectedAddressId(defaultAddr.id);
      addressInitialized.current = true;
    }
  }, [addresses]);

  const applyCoupon = async () => {
    if (!coupon.trim() || !cart) return;
    setCouponError(null);
    try {
      const res = await couponApi.validate(coupon.trim(), cart.subtotal);
      setCouponDiscount(res.data?.discount ?? 0);
    } catch (err) {
      setCouponDiscount(null);
      setCouponError(extractApiError(err, 'Invalid coupon code.'));
    }
  };

  const shippingAddress = (): Record<string, string> => {
    if (selectedAddress) {
      return {
        full_name: selectedAddress.full_name,
        phone: selectedAddress.phone,
        address_line_1: selectedAddress.address_line_1,
        city: selectedAddress.city,
        country: selectedAddress.country,
      };
    }
    return form;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await orderApi.checkout({
        shipping_address: shippingAddress(),
        coupon_code: coupon.trim() || undefined,
        payment_gateway: gateway,
      });

      if (res.data?.order) {
        resetCart();

        const meta = res.data.payment?.metadata as Record<string, string> | undefined;
        const paymentUrl = meta?.payment_url ?? meta?.redirect_url;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }

        navigate(`/orders/${res.data.order.uuid}`, {
          state: { orderPlaced: true, message: res.message },
        });
      }
    } catch (err) {
      setError(extractApiError(err, 'Could not place your order. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="page-container py-12">
        <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="h-8 w-48 rounded-lg bg-muted" />
            <div className="h-40 rounded-xl bg-muted" />
            <div className="h-56 rounded-xl bg-muted" />
          </div>
          <div className="h-72 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-container py-16 text-center">
        <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="mb-2 text-xl font-semibold">Nothing to checkout</h1>
        <p className="mb-6 text-sm text-muted-foreground">Your cart is empty. Add products first.</p>
        <Button asChild>
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  const estimatedTotal = Math.max(0, cart.subtotal - (couponDiscount ?? 0));

  return (
    <div className="page-container py-8 lg:py-10">
      <div className="mb-8">
        <Link
          to="/cart"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'} · Secure checkout
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-10">
            <CheckoutSection step={1} title="Delivery address" description="Where should we deliver your order?">
              {addresses.length > 0 && (
                <div className="mb-4 space-y-2">
                  {addresses.map((addr: Address) => (
                    <SelectableCard
                      key={addr.id}
                      selected={selectedAddressId === addr.id}
                      onSelect={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 text-sm">
                          <p className="font-medium">
                            {addr.label}
                            {addr.is_default && (
                              <span className="ml-2 text-xs font-normal text-primary">Default</span>
                            )}
                          </p>
                          <p className="mt-0.5 text-muted-foreground">{addr.full_name} · {addr.phone}</p>
                          <p className="text-muted-foreground">
                            {addr.address_line_1}, {addr.city}, {addr.country}
                          </p>
                        </div>
                      </div>
                    </SelectableCard>
                  ))}
                  <SelectableCard
                    selected={selectedAddressId === 'new'}
                    onSelect={() => setSelectedAddressId('new')}
                  >
                    <p className="text-sm font-medium">+ Add a new address</p>
                  </SelectableCard>
                </div>
              )}

              {(addresses.length === 0 || selectedAddressId === 'new') && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['full_name', 'phone', 'address_line_1', 'city', 'country'] as const).map((field) => (
                    <div key={field} className={field === 'address_line_1' ? 'sm:col-span-2' : ''}>
                      <Label htmlFor={field} className="capitalize">
                        {field.replace('_', ' ')}
                      </Label>
                      <Input
                        id={field}
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CheckoutSection>

            <CheckoutSection step={2} title="Payment method" description="Choose how you want to pay">
              <div className="grid gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <SelectableCard
                      key={m.id}
                      selected={gateway === m.id}
                      onSelect={() => setGateway(m.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{m.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                    </SelectableCard>
                  );
                })}
              </div>
            </CheckoutSection>

            <CheckoutSection step={3} title="Coupon code" description="Optional discount">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="coupon"
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value);
                      setCouponDiscount(null);
                      setCouponError(null);
                    }}
                    placeholder="Enter code"
                    className="pl-9"
                  />
                </div>
                <Button type="button" variant="outline" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
              {couponDiscount !== null && couponDiscount > 0 && (
                <p className="mt-2 text-sm text-emerald-700">
                  Coupon applied — you save {formatCurrency(couponDiscount)}
                </p>
              )}
              {couponError && <p className="mt-2 text-sm text-destructive">{couponError}</p>}
            </CheckoutSection>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Order summary</h2>

              <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                {cart.items.map((item) => {
                  const image = item.product?.images?.find((i) => i.is_primary) ?? item.product?.images?.[0];
                  return (
                    <li key={item.id} className="flex gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {image ? (
                          <img src={image.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm font-medium">{formatCurrency(item.total)}</p>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                {couponDiscount !== null && couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping & tax</span>
                  <span className="text-xs">At confirmation</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Estimated total</span>
                  <span>{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
                {submitting ? 'Placing order…' : 'Place order'}
              </Button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Your payment info is handled securely
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By placing your order you agree to NileShop&apos;s terms of service.
            </p>
          </aside>
        </div>
      </form>
    </div>
  );
}
