import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ShoppingBag, Store, Truck, Wallet } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { CardMenu } from '@/components/dashboard/CardMenu';
import { DashboardCard, DashboardCardContent, DashboardCardHeader } from '@/components/dashboard/DashboardCard';
import { DummyDataBadge } from '@/components/dashboard/DummyDataBadge';
import { dummySalesTrend, dummyTopProducts } from '@/components/dashboard/dummyChartData';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopProductsDonut } from '@/components/dashboard/TopProductsDonut';
import { StatCard, StatGrid } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard });
  const { data: report } = useQuery({
    queryKey: ['admin-reports', 14],
    queryFn: () => adminApi.reports(14),
  });
  const { data: vendors } = useQuery({
    queryKey: ['admin-vendors-pending'],
    queryFn: () => adminApi.vendors('pending'),
  });
  const { data: deliveries } = useQuery({
    queryKey: ['admin-deliveries-overview'],
    queryFn: () => adminApi.deliveries('pending'),
  });

  const s = data?.data;
  const realDailySales = report?.data?.daily_sales ?? [];
  const realTopProducts = report?.data?.top_products ?? [];
  const dailySalesIsDummy = realDailySales.length === 0;
  const topProductsIsDummy = realTopProducts.length === 0;
  const dailySales = useMemo(() => (dailySalesIsDummy ? dummySalesTrend() : realDailySales), [dailySalesIsDummy, realDailySales]);
  const topProducts = useMemo(() => (topProductsIsDummy ? dummyTopProducts() : realTopProducts), [topProductsIsDummy, realTopProducts]);

  return (
    <>
      <PageHeader title="Overview" description="Monitor platform activity, vendors, and deliveries." />

      {s && (
        <StatGrid className="sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Revenue today"
            value={formatCurrency(s.revenue_today)}
            hint={`${formatCurrency(s.revenue_month)} this month`}
            icon={Wallet}
            tone="accent"
            size="sm"
          />
          <StatCard
            label="Total orders"
            value={s.total_orders}
            icon={ShoppingBag}
            tone="primary"
            hint={`${s.pending_orders} pending`}
            size="sm"
          />
          <StatCard
            label="Vendors"
            value={s.total_vendors}
            icon={Store}
            tone="primary"
            hint={`${s.pending_vendors} pending`}
            size="sm"
          />
          <StatCard label="Products" value={s.total_products} icon={Package} tone="primary" size="sm" />
          <StatCard label="Active deliveries" value={s.active_deliveries} icon={Truck} tone="primary" size="sm" />
        </StatGrid>
      )}

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <DashboardCard className="lg:col-span-2">
          <DashboardCardHeader
            title="Revenue Analytics — last 14 days"
            action={
              <div className="flex items-center gap-2">
                {dailySalesIsDummy && <DummyDataBadge />}
                <CardMenu queryKey={['admin-reports', 14]} />
              </div>
            }
          />
          <DashboardCardContent>
            <RevenueChart data={dailySales} />
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader
            title="Top Products"
            action={
              <div className="flex items-center gap-2">
                {topProductsIsDummy && <DummyDataBadge />}
                <CardMenu queryKey={['admin-reports', 14]} />
              </div>
            }
          />
          <DashboardCardContent>
            <TopProductsDonut data={topProducts} />
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <DashboardCard>
          <DashboardCardHeader
            title="Pending vendor approvals"
            action={
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Link to="/admin/vendors">View all</Link>
                </Button>
                <CardMenu queryKey={['admin-vendors-pending']} />
              </div>
            }
          />
          <DashboardCardContent>
            {vendors?.data?.length ? (
              <ListShell>
                {vendors.data.slice(0, 5).map((v) => (
                  <ListRow key={v.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{v.store_name}</p>
                        <p className="text-sm text-muted-foreground">{v.city}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            adminApi
                              .approveVendor(v.id)
                              .then(() => queryClient.invalidateQueries({ queryKey: ['admin-vendors-pending'] }))
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            adminApi
                              .rejectVendor(v.id)
                              .then(() => queryClient.invalidateQueries({ queryKey: ['admin-vendors-pending'] }))
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </ListRow>
                ))}
              </ListShell>
            ) : (
              <EmptyState icon={Store} title="No pending vendors" />
            )}
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader
            title="Deliveries needing attention"
            action={
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Link to="/admin/deliveries">View all</Link>
                </Button>
                <CardMenu queryKey={['admin-deliveries-overview']} />
              </div>
            }
          />
          <DashboardCardContent>
            {deliveries?.data?.length ? (
              <ListShell>
                {deliveries.data.slice(0, 5).map((d) => (
                  <ListRow key={d.uuid}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{d.order?.order_number ?? d.uuid}</p>
                      <StatusBadge status={d.status} />
                    </div>
                  </ListRow>
                ))}
              </ListShell>
            ) : (
              <EmptyState icon={Truck} title="No deliveries need attention" />
            )}
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </>
  );
}
