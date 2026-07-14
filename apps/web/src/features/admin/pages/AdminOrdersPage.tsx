import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Select } from '@/components/ui/select';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PER_PAGE = 20;

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn: () => adminApi.orders(status || undefined, page),
  });

  const orders = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const updateStatus = (uuid: string, newStatus: string) => {
    adminApi
      .updateOrderStatus(uuid, newStatus)
      .then(() => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }));
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Review and manage orders across the platform."
        actions={
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-auto min-w-40"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </Select>
        }
      />

      <DashboardSection title={`${total} orders`}>
        {orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Payment</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.uuid}>
                      <td className="py-3 pr-4 font-medium">{order.order_number}</td>
                      <td className="py-3 pr-4">{order.shipping_address?.full_name ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.payment_status} />
                      </td>
                      <td className="py-3 pr-4">
                        <Select
                          value={order.status}
                          onChange={(e) => updateStatus(order.uuid, e.target.value)}
                          className="h-9 w-auto min-w-36 py-1 text-xs"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination page={page} total={total} perPage={PER_PAGE} onPageChange={setPage} />
            </div>
          </>
        )}
      </DashboardSection>
    </>
  );
}
