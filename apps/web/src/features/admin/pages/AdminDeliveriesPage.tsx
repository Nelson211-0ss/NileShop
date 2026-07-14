import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const DELIVERY_STATUSES = ['pending', 'assigned', 'picked_up', 'delivered'];
const PER_PAGE = 20;

function RiderPicker({ deliveryUuid }: { deliveryUuid: string }) {
  const queryClient = useQueryClient();
  const { data: riders } = useQuery({ queryKey: ['admin-riders'], queryFn: adminApi.riders });
  const [selected, setSelected] = useState('');

  const assign = () => {
    if (!selected) return;
    adminApi
      .assignDelivery(deliveryUuid, Number(selected))
      .then(() => queryClient.invalidateQueries({ queryKey: ['admin-deliveries'] }));
  };

  return (
    <div className="flex gap-2">
      <Select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-9 w-auto min-w-40 py-1 text-xs">
        <option value="">Assign rider…</option>
        {riders?.data?.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
      <Button size="sm" disabled={!selected} onClick={assign}>
        Assign
      </Button>
    </div>
  );
}

export function AdminDeliveriesPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin-deliveries', status, page],
    queryFn: () => adminApi.deliveries(status || undefined, page),
  });

  const deliveries = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Track delivery status and assign riders."
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
            {DELIVERY_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        }
      />

      <DashboardSection title={`${total} deliveries`}>
        {deliveries.length === 0 ? (
          <EmptyState icon={Truck} title="No deliveries found" />
        ) : (
          <>
            <ListShell>
              {deliveries.map((d) => (
                <ListRow key={d.uuid}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{d.order?.order_number ?? d.uuid}</p>
                        <StatusBadge status={d.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {d.order?.total != null && `${formatCurrency(d.order.total)} · `}
                        {d.rider ? `Rider: ${d.rider.name}` : 'No rider assigned'}
                      </p>
                    </div>
                    {!d.rider && d.status === 'pending' && <RiderPicker deliveryUuid={d.uuid} />}
                  </div>
                </ListRow>
              ))}
            </ListShell>
            <div className="mt-4">
              <Pagination page={page} total={total} perPage={PER_PAGE} onPageChange={setPage} />
            </div>
          </>
        )}
      </DashboardSection>
    </>
  );
}
