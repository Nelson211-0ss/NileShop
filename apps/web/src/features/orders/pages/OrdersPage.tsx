import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { orderApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';

export function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: orderApi.list });
  const orders = data?.data ?? [];

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {isLoading ? <div className="h-32 bg-muted rounded-2xl animate-pulse" /> : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet. <Link to="/products" className="text-primary">Start shopping</Link></p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.uuid} to={`/orders/${order.uuid}`}
              className="block rounded-2xl border border-border p-4 hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(order.total)}</p>
                  <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">{order.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['order', uuid],
    queryFn: () => orderApi.get(uuid!),
    enabled: !!uuid,
  });
  const order = data?.data;

  if (isLoading) return <div className="page-container py-12"><div className="h-64 bg-muted rounded-2xl animate-pulse" /></div>;
  if (!order) return <div className="page-container py-12">Order not found.</div>;

  return (
    <div className="page-container py-8 max-w-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary">{order.status}</span>
      </div>

      <div className="rounded-2xl border border-border p-6 mb-6 space-y-3">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.product_name} × {item.quantity}</span>
            <span>{formatCurrency(item.total)}</span>
          </div>
        ))}
        <div className="border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(order.shipping_cost)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
      </div>

      {order.status_histories && (
        <div className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-4">Order Timeline</h2>
          <div className="space-y-3">
            {order.status_histories.map((h, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium capitalize">{h.status}</p>
                  {h.note && <p className="text-muted-foreground">{h.note}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {['pending', 'confirmed'].includes(order.status) && (
        <Button variant="outline" className="mt-4" onClick={() => orderApi.cancel(order.uuid)}>
          Cancel Order
        </Button>
      )}
    </div>
  );
}
