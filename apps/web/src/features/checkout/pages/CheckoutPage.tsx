import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { addressApi, cartApi, couponApi, orderApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import type { Address, PaymentGateway } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartActions } from '@/hooks/useCart';
import { extractApiError } from '@/lib/apiErrors';

const PAYMENT_METHODS: { id: PaymentGateway; label: string; description: string }[] = [
  { id: 'cash_on_delivery', label: 'Cash on delivery', description: 'Pay when your order arrives.' },
  { id: 'mobile_money', label: 'Mobile money', description: 'Pay via mobile money after placing the order.' },
  { id: 'bank_transfer', label: 'Bank transfer', description: 'Transfer using the reference shown after checkout.' },
  { id: 'wallet', label: 'NileShop wallet', description: 'Deduct from your wallet balance instantly.' },
  { id: 'card', label: 'Card', description: 'Pay by card if configured.' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { resetCart } = useCartActions();
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
    return <div className="page-container py-12"><div className="h-48 animate-pulse rounded-lg bg-muted" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-container py-12 text-center">
        <p className="mb-4 text-muted-foreground">Your cart is empty.</p>
        <Button asChild><Link to="/products">Browse products</Link></Button>
      </div>
    );
  }

  const estimatedTotal = Math.max(0, cart.subtotal - (couponDiscount ?? 0));

  return (
    <div className="page-container max-w-3xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-semibold">Order items</h2>
          <div className="divide-y divide-border">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold">Shipping address</h2>
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((addr: Address) => (
                <label
                  key={addr.id}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
                    selectedAddressId === addr.id ? 'border-primary' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="text-sm">
                    <p className="font-medium">{addr.label} · {addr.full_name}</p>
                    <p className="text-muted-foreground">
                      {addr.address_line_1}, {addr.city}, {addr.country}
                    </p>
                    <p className="text-muted-foreground">{addr.phone}</p>
                  </div>
                </label>
              ))}
              <label
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
                  selectedAddressId === 'new' ? 'border-primary' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === 'new'}
                  onChange={() => setSelectedAddressId('new')}
                />
                <span className="text-sm font-medium">Use a new address</span>
              </label>
            </div>
          )}

          {(addresses.length === 0 || selectedAddressId === 'new') && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(['full_name', 'phone', 'address_line_1', 'city', 'country'] as const).map((field) => (
                <div key={field} className={field === 'address_line_1' ? 'sm:col-span-2' : ''}>
                  <Label className="capitalize">{field.replace('_', ' ')}</Label>
                  <Input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold">Payment method</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
                  gateway === m.id ? 'border-primary' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="gateway"
                  value={m.id}
                  checked={gateway === m.id}
                  onChange={() => setGateway(m.id)}
                />
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <Label htmlFor="coupon">Coupon code</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              value={coupon}
              onChange={(e) => {
                setCoupon(e.target.value);
                setCouponDiscount(null);
                setCouponError(null);
              }}
              placeholder="Optional"
            />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {couponDiscount !== null && (
            <p className="text-sm text-emerald-700">Discount: {formatCurrency(couponDiscount)}</p>
          )}
          {couponError && <p className="text-sm text-destructive">{couponError}</p>}
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          {couponDiscount !== null && couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-emerald-700">
              <span>Coupon discount</span>
              <span>-{formatCurrency(couponDiscount)}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Shipping and tax are calculated when you place the order.
          </p>
          <div className="flex justify-between pt-2 text-lg font-semibold">
            <span>Estimated total</span>
            <span>{formatCurrency(estimatedTotal)}</span>
          </div>
          <Button type="submit" size="lg" className="mt-4 w-full" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </Button>
        </section>
      </form>
    </div>
  );
}
