import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Package, Plus, ShoppingBag, Store, Wallet } from 'lucide-react';
import { conversationApi, vendorApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { CardMenu } from '@/components/dashboard/CardMenu';
import { DashboardCard, DashboardCardContent, DashboardCardHeader } from '@/components/dashboard/DashboardCard';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { StatCard, StatGrid } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export function VendorDashboardPage() {
  const queryClient = useQueryClient();
  const { data: store } = useQuery({ queryKey: ['vendor-store'], queryFn: vendorApi.myStore });
  const { data: products } = useQuery({ queryKey: ['vendor-products'], queryFn: vendorApi.myProducts });
  const { data: orders } = useQuery({ queryKey: ['vendor-orders'], queryFn: () => vendorApi.myOrders() });
  const { data: conversations } = useQuery({
    queryKey: ['vendor-conversations'],
    queryFn: conversationApi.vendorList,
    refetchInterval: 15000,
  });

  const removeProduct = useMutation({
    mutationFn: (id: number) => vendorApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-products'] }),
  });

  const productList = products?.data ?? [];
  const orderList = orders?.data ?? [];
  const messageList = Array.isArray(conversations?.data) ? conversations.data : [];
  const unreadMessages = messageList.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
  const revenue = orderList
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const revenueTrend = useMemo(() => {
    const byDate = new Map<string, { revenue: number; orders: number }>();
    orderList
      .filter((o) => o.payment_status === 'paid')
      .forEach((o) => {
        const date = o.created_at.slice(0, 10);
        const entry = byDate.get(date) ?? { revenue: 0, orders: 0 };
        entry.revenue += o.total;
        entry.orders += 1;
        byDate.set(date, entry);
      });

    return Array.from(byDate.entries())
      .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [orderList]);

  return (
    <>
      <PageHeader
        title="Store overview"
        description={
          store?.data
            ? `${store.data.store_name} · ${store.data.city ?? store.data.country}`
            : 'Manage your products and orders.'
        }
        actions={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/vendor/messages">
                <MessageCircle className="mr-2 h-4 w-4" />
                Messages
                {unreadMessages > 0 && (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/vendor/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add product
              </Link>
            </Button>
          </div>
        }
      />

      <StatGrid>
        <StatCard label="Revenue" value={formatCurrency(revenue)} icon={Wallet} hint="From paid orders" tone="accent" />
        <StatCard label="Products" value={productList.length} icon={Package} tone="primary" />
        <StatCard label="Orders" value={orderList.length} icon={ShoppingBag} tone="primary" />
        <StatCard label="Store status" value={store?.data?.status ?? '—'} icon={Store} tone="primary" />
      </StatGrid>

      <DashboardCard className="mb-5">
        <DashboardCardHeader title="Revenue from your orders" action={<CardMenu queryKey={['vendor-orders']} />} />
        <DashboardCardContent>
          {revenueTrend.length > 0 ? (
            <RevenueChart data={revenueTrend} />
          ) : (
            <EmptyState icon={Wallet} title="No paid orders yet" />
          )}
        </DashboardCardContent>
      </DashboardCard>

      <div className="space-y-4">
        <DashboardCard>
          <DashboardCardHeader
            title="Customer messages"
            action={
              <div className="flex items-center gap-1">
                {messageList.length > 0 && (
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Link to="/vendor/messages">View all</Link>
                  </Button>
                )}
                <CardMenu queryKey={['vendor-conversations']} />
              </div>
            }
          />
          <DashboardCardContent>
            {messageList.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No messages yet"
                description="When customers chat with you from a product page, their messages will show here."
              />
            ) : (
              <ListShell>
                {messageList.slice(0, 5).map((conversation) => (
                  <ListRow key={conversation.id}>
                    <Link
                      to={`/vendor/messages/${conversation.id}`}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{conversation.peer_name ?? conversation.customer?.name}</p>
                        {conversation.product && (
                          <p className="text-xs text-muted-foreground">{conversation.product.name}</p>
                        )}
                        {conversation.last_message && (
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            {conversation.last_message.body}
                          </p>
                        )}
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                          {conversation.unread_count} new
                        </span>
                      )}
                    </Link>
                  </ListRow>
                ))}
              </ListShell>
            )}
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader title="Products" action={<CardMenu queryKey={['vendor-products']} />} />
          <DashboardCardContent>
            {productList.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products yet"
                action={
                  <Button asChild size="sm">
                    <Link to="/vendor/products/new">Add product</Link>
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Product</th>
                      <th className="pb-3 font-medium">Price</th>
                      <th className="pb-3 font-medium">Stock</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productList.map((product) => (
                      <tr key={product.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{product.name}</p>
                          {product.category && (
                            <p className="text-xs text-muted-foreground">{product.category.name}</p>
                          )}
                        </td>
                        <td className="py-3">{formatCurrency(product.price)}</td>
                        <td className="py-3">{product.stock}</td>
                        <td className="py-3">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/vendor/products/${product.id}/edit`}>Edit</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => removeProduct.mutate(product.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader
            title="Recent orders"
            action={
              <div className="flex items-center gap-1">
                {orderList.length > 0 && (
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Link to="/vendor/orders">View all</Link>
                  </Button>
                )}
                <CardMenu queryKey={['vendor-orders']} />
              </div>
            }
          />
          <DashboardCardContent>
            {orderList.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="No orders yet" />
            ) : (
              <ListShell>
                {orderList.slice(0, 5).map((order) => (
                  <ListRow key={order.uuid}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </ListRow>
                ))}
              </ListShell>
            )}
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </>
  );
}
