import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { vendorApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const PER_PAGE = 15;

export function VendorOrdersPage() {
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['vendor-orders-page', page],
    queryFn: () => vendorApi.myOrders(page),
  });

  const orders = data?.data ?? [];
  const total = data?.meta?.total ?? orders.length;

  return (
    <>
      <PageHeader title="Orders" description="Orders containing items from your store." />

      <DashboardSection title={`${total} orders`}>
        {orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders yet" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Order</th>
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
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.payment_status} />
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.status} />
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
