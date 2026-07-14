import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ShoppingBag, Store, Truck, Users } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
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

  return (
    <>
      <PageHeader title="Overview" description="Monitor platform activity, vendors, and deliveries." />

      {s && (
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Users" value={s.total_users} icon={Users} />
          <StatCard label="Vendors" value={s.total_vendors} icon={Store} />
          <StatCard label="Pending vendors" value={s.pending_vendors} icon={Store} />
          <StatCard label="Products" value={s.total_products} icon={Package} />
          <StatCard label="Published products" value={s.published_products} icon={Package} />
          <StatCard label="Orders" value={s.total_orders} icon={ShoppingBag} />
          <StatCard label="Pending orders" value={s.pending_orders} icon={ShoppingBag} />
          <StatCard label="Active deliveries" value={s.active_deliveries} icon={Truck} />
          <StatCard
            label="Revenue today"
            value={formatCurrency(s.revenue_today)}
            hint={`${formatCurrency(s.revenue_month)} this month`}
            icon={Package}
          />
        </StatGrid>
      )}

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base">Revenue — last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          {report?.data?.daily_sales?.length ? (
            <RevenueChart data={report.data.daily_sales} />
          ) : (
            <EmptyState icon={Package} title="No revenue data yet" />
          )}
        </CardContent>
      </Card>

      <div className="space-y-10">
        <DashboardSection
          title="Pending vendor approvals"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/vendors">View all</Link>
            </Button>
          }
        >
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
                          adminApi.approveVendor(v.id).then(() =>
                            queryClient.invalidateQueries({ queryKey: ['admin-vendors-pending'] }),
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          adminApi.rejectVendor(v.id).then(() =>
                            queryClient.invalidateQueries({ queryKey: ['admin-vendors-pending'] }),
                          )
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
        </DashboardSection>

        <DashboardSection
          title="Deliveries needing attention"
          description="Unassigned deliveries waiting for a rider."
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/deliveries">View all</Link>
            </Button>
          }
        >
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
        </DashboardSection>
      </div>
    </>
  );
}
