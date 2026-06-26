import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { addressApi, cartApi, orderApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import type { PaymentGateway } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PAYMENT_METHODS: { id: PaymentGateway; label: string }[] = [
  { id: 'cash_on_delivery', label: 'Cash on Delivery' },
  { id: 'mobile_money', label: 'Mobile Money' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'wallet', label: 'NileShop Wallet' },
  { id: 'card', label: 'Credit/Debit Card' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const [gateway, setGateway] = useState<PaymentGateway>('cash_on_delivery');
  const [coupon, setCoupon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', address_line_1: '', city: 'Juba', country: 'South Sudan' });

  const { data: cartData } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const { data: addressData } = useQuery({ queryKey: ['addresses'], queryFn: addressApi.list });
  const cart = cartData?.data;
  const defaultAddress = addressData?.data?.find((a) => a.is_default) ?? addressData?.data?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const shipping = defaultAddress ? {
        full_name: defaultAddress.full_name,
        phone: defaultAddress.phone,
        address_line_1: defaultAddress.address_line_1,
        city: defaultAddress.city,
        country: defaultAddress.country,
      } : form;

      const res = await orderApi.checkout({
        shipping_address: shipping,
        coupon_code: coupon || undefined,
        payment_gateway: gateway,
      });

      if (res.data?.order) {
        const meta = res.data.payment?.metadata as Record<string, string> | undefined;
        const paymentUrl = meta?.payment_url ?? meta?.redirect_url;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
        navigate(`/orders/${res.data.order.uuid}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <div className="page-container py-12 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="page-container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {!defaultAddress && (
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold">Shipping Address</h2>
            {(['full_name', 'phone', 'address_line_1', 'city'] as const).map((field) => (
              <div key={field}>
                <Label>{field.replace('_', ' ')}</Label>
                <Input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required />
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-4">Payment Method</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${gateway === m.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input type="radio" name="gateway" value={m.id} checked={gateway === m.id} onChange={() => setGateway(m.id)} />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border p-6">
          <Label>Coupon Code</Label>
          <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code" className="mt-2" />
        </div>

        <div className="rounded-2xl border border-border p-6">
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span><span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <Button type="submit" size="lg" className="w-full mt-4" disabled={submitting}>
            {submitting ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
