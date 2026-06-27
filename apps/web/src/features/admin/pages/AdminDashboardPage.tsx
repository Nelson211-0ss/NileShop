import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ShoppingBag, Store, Users } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard, StatGrid } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard });
  const { data: vendors } = useQuery({
    queryKey: ['admin-vendors-pending'],
    queryFn: () => adminApi.vendors('pending'),
  });
  const { data: deliveries } = useQuery({ queryKey: ['admin-deliveries'], queryFn: adminApi.deliveries });
  const { data: riders } = useQuery({ queryKey: ['admin-riders'], queryFn: adminApi.riders });

  const s = data?.data;

  const assignRider = async (deliveryUuid: string, riderId: number) => {
    await adminApi.assignDelivery(deliveryUuid, riderId);
    queryClient.invalidateQueries({ queryKey: ['admin-deliveries'] });
  };

  return (
    <>
      <PageHeader title="Overview" description="Monitor platform activity, vendors, and deliveries." />

      {s && (
        <StatGrid className="lg:grid-cols-4">
          <StatCard label="Users" value={s.total_users} icon={Users} />
          <StatCard label="Orders" value={s.total_orders} icon={ShoppingBag} />
          <StatCard label="Revenue today" value={formatCurrency(s.revenue_today)} icon={Package} />
          <StatCard label="Pending vendors" value={s.pending_vendors} icon={Store} />
        </StatGrid>
      )}

      <div className="space-y-10">
        <DashboardSection title="Pending vendor approvals">
          {vendors?.data?.length ? (
            <ListShell>
              {vendors.data.map((v) => (
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

        <DashboardSection title="Deliveries">
          {deliveries?.data?.length ? (
            <ListShell>
              {deliveries.data.map((d) => (
                <ListRow key={d.uuid}>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{d.order?.order_number ?? d.uuid}</p>
                      <StatusBadge status={d.status} />
                      {d.rider && (
                        <span className="text-xs text-muted-foreground">Rider: {d.rider.name}</span>
                      )}
                    </div>
                    {!d.rider && d.status === 'pending' && (
                      <div className="flex flex-wrap gap-2">
                        {riders?.data?.map((r) => (
                          <Button key={r.id} size="sm" variant="ghost" onClick={() => assignRider(d.uuid, r.id)}>
                            Assign {r.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </ListRow>
              ))}
            </ListShell>
          ) : (
            <EmptyState icon={Package} title="No deliveries" />
          )}
        </DashboardSection>
      </div>
    </>
  );
}
