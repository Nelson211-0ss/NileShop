import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ShoppingBag, Store, Users } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
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
      <PageHeader
        title="Overview"
        description="Monitor platform activity, vendors, and deliveries."
      />

      {s && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Users" value={s.total_users} icon={Users} />
          <StatCard label="Orders" value={s.total_orders} icon={ShoppingBag} />
          <StatCard label="Revenue today" value={formatCurrency(s.revenue_today)} icon={Package} />
          <StatCard label="Pending vendors" value={s.pending_vendors} icon={Store} />
        </div>
      )}

      <div className="space-y-6">
        <DashboardSection title="Pending vendor approvals">
          {vendors?.data?.length ? (
            <div className="space-y-3">
              {vendors.data.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
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
                      variant="outline"
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
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Store}
              title="No pending vendors"
              description="New vendor applications will appear here."
            />
          )}
        </DashboardSection>

        <DashboardSection title="Deliveries">
          {deliveries?.data?.length ? (
            <div className="space-y-3">
              {deliveries.data.map((d) => (
                <div key={d.uuid} className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{d.order?.order_number ?? d.uuid}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StatusBadge status={d.status} />
                        {d.rider && (
                          <span className="text-xs text-muted-foreground">Rider: {d.rider.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!d.rider && d.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      {riders?.data?.map((r) => (
                        <Button key={r.id} size="sm" variant="outline" onClick={() => assignRider(d.uuid, r.id)}>
                          Assign {r.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No deliveries"
              description="Delivery requests will show up here."
            />
          )}
        </DashboardSection>
      </div>
    </>
  );
}
