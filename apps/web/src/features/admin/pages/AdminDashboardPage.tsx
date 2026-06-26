import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard });
  const { data: vendors } = useQuery({ queryKey: ['admin-vendors-pending'], queryFn: () => adminApi.vendors('pending') });
  const { data: deliveries } = useQuery({ queryKey: ['admin-deliveries'], queryFn: adminApi.deliveries });
  const { data: riders } = useQuery({ queryKey: ['admin-riders'], queryFn: adminApi.riders });

  const s = data?.data;

  const assignRider = async (deliveryUuid: string, riderId: number) => {
    await adminApi.assignDelivery(deliveryUuid, riderId);
    queryClient.invalidateQueries({ queryKey: ['admin-deliveries'] });
  };

  return (
    <div className="page-container py-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      {s && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: 'Users', value: s.total_users },
            { label: 'Orders', value: s.total_orders },
            { label: 'Revenue Today', value: formatCurrency(s.revenue_today) },
            { label: 'Pending Vendors', value: s.pending_vendors },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-sm mb-3">Pending Vendor Approvals</h2>
      <div className="space-y-2 mb-8">
        {vendors?.data?.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="font-medium text-sm">{v.store_name}</p>
              <p className="text-xs text-muted-foreground">{v.city}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => adminApi.approveVendor(v.id).then(() => queryClient.invalidateQueries({ queryKey: ['admin-vendors-pending'] }))}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => adminApi.rejectVendor(v.id).then(() => queryClient.invalidateQueries({ queryKey: ['admin-vendors-pending'] }))}>Reject</Button>
            </div>
          </div>
        ))}
        {!vendors?.data?.length && <p className="text-sm text-muted-foreground">No pending vendors.</p>}
      </div>

      <h2 className="font-semibold text-sm mb-3">Deliveries</h2>
      <div className="space-y-2">
        {deliveries?.data?.map((d) => (
          <div key={d.uuid} className="rounded-lg border border-border p-3">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-medium">{d.order?.order_number ?? d.uuid}</p>
                <p className="text-xs text-muted-foreground capitalize">{d.status} {d.rider ? `· ${d.rider.name}` : ''}</p>
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
        {!deliveries?.data?.length && <p className="text-sm text-muted-foreground">No deliveries.</p>}
      </div>
    </div>
  );
}
