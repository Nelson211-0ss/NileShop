import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Package, ShoppingBag, Store, Truck, Users, Wallet } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { CardMenu } from '@/components/dashboard/CardMenu';
import { DashboardCard, DashboardCardContent, DashboardCardHeader } from '@/components/dashboard/DashboardCard';
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
  const topProducts = report?.data?.top_products ?? [];

  return (
    <>
      <PageHeader title="Overview" description="Monitor platform activity, vendors, and deliveries." />

      {s && (
        <StatGrid>
          <StatCard
            label="Revenue today"
            value={formatCurrency(s.revenue_today)}
            hint={`${formatCurrency(s.revenue_month)} this month`}
            icon={Wallet}
            tone="accent"
          />
          <StatCard label="Total orders" value={s.total_orders} icon={ShoppingBag} tone="primary" hint={`${s.pending_orders} pending`} />
          <StatCard label="Total users" value={s.total_users} icon={Users} tone="primary" />
          <StatCard label="Active deliveries" value={s.active_deliveries} icon={Truck} tone="primary" />
        </StatGrid>
      )}

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <DashboardCard className="lg:col-span-2">
          <DashboardCardHeader
            title="Revenue Analytics — last 14 days"
            action={<CardMenu queryKey={['admin-reports', 14]} />}
          />
          <DashboardCardContent>
            {report?.data?.daily_sales?.length ? (
              <RevenueChart data={report.data.daily_sales} />
            ) : (
              <EmptyState icon={Package} title="No revenue data yet" />
            )}
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader title="Top Products" action={<CardMenu queryKey={['admin-reports', 14]} />} />
          <DashboardCardContent>
            <TopProductsDonut data={topProducts} />
          </DashboardCardContent>
        </DashboardCard>
      </div>

      {s && (
        <StatGrid className="sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Vendors" value={s.total_vendors} icon={Store} />
          <StatCard label="Pending vendors" value={s.pending_vendors} icon={Clock} />
          <StatCard label="Products" value={s.total_products} icon={Package} />
          <StatCard label="Published products" value={s.published_products} icon={CheckCircle2} />
          <StatCard label="Pending orders" value={s.pending_orders} icon={ShoppingBag} />
        </StatGrid>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
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
