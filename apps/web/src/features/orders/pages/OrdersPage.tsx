import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { orderApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: orderApi.list });
  const orders = data?.data ?? [];

  return (
    <>
      <PageHeader title="Orders" description="Track and manage your purchases." />

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order, it will show up here."
          action={
            <Button asChild size="sm">
              <Link to="/products">Start shopping</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.uuid}
              to={`/orders/${order.uuid}`}
              className="block rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total)}</p>
                  <div className="mt-2">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
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

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  if (!order) {
    return (
      <EmptyState icon={ShoppingBag} title="Order not found" description="This order may have been removed." />
    );
  }

  return (
    <>
      <PageHeader
        title={order.order_number}
        description={new Date(order.created_at).toLocaleString()}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="mb-6 rounded-xl border border-border bg-background p-5">
        <h2 className="mb-4 text-sm font-semibold">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {order.status_histories && (
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-4 text-sm font-semibold">Order timeline</h2>
          <div className="space-y-4">
            {order.status_histories.map((h, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-foreground/70" />
                <div>
                  <p className="font-medium capitalize">{h.status.replace(/_/g, ' ')}</p>
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
          Cancel order
        </Button>
      )}
    </>
  );
}
