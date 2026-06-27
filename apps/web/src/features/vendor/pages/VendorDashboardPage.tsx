import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, ShoppingBag, Store } from 'lucide-react';
import { vendorApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard, StatGrid } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export function VendorDashboardPage() {
  const queryClient = useQueryClient();
  const { data: store } = useQuery({ queryKey: ['vendor-store'], queryFn: vendorApi.myStore });
  const { data: products } = useQuery({ queryKey: ['vendor-products'], queryFn: vendorApi.myProducts });
  const { data: orders } = useQuery({ queryKey: ['vendor-orders'], queryFn: vendorApi.myOrders });

  const removeProduct = useMutation({
    mutationFn: (id: number) => vendorApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-products'] }),
  });

  const productList = products?.data ?? [];
  const orderList = orders?.data ?? [];

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
          <Button asChild size="sm">
            <Link to="/vendor/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add product
            </Link>
          </Button>
        }
      />

      <StatGrid className="sm:grid-cols-3 lg:grid-cols-3">
        <StatCard label="Products" value={productList.length} icon={Package} />
        <StatCard label="Orders" value={orderList.length} icon={ShoppingBag} />
        <StatCard label="Store status" value={store?.data?.status ?? '—'} icon={Store} />
      </StatGrid>

      <div className="space-y-10">
        <DashboardSection title="Products">
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
        </DashboardSection>

        <DashboardSection title="Recent orders">
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
        </DashboardSection>
      </div>
    </>
  );
}
