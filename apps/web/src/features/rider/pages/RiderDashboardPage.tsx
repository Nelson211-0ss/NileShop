import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCircle2, MapPin, Truck, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { CardMenu } from '@/components/dashboard/CardMenu';
import { DashboardCard, DashboardCardContent, DashboardCardHeader } from '@/components/dashboard/DashboardCard';
import { cn } from '@/lib/utils';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { StatCard, StatGrid } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatCurrency } from '@nileshop/utils';

interface Delivery {
  uuid: string;
  status: string;
  earnings: number;
  delivered_at?: string | null;
  order?: { order_number: string; shipping_address?: Record<string, string> };
}

const STEPS = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'delivered', label: 'Delivered' },
];

function DeliverySteps({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const done = currentIndex >= 0 && i <= currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
                done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
              )}
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 w-6', done && i < currentIndex ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RiderDashboardPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const { data: deliveries } = useQuery({
    queryKey: ['rider-deliveries'],
    queryFn: () => api.get<ApiResponse<Delivery[]>>('/rider/deliveries').then((r) => r.data),
  });

  const { data: earnings } = useQuery({
    queryKey: ['rider-earnings'],
    queryFn: () =>
      api
        .get<
          ApiResponse<{ total_earnings: number; today_earnings: number; completed_deliveries: number }>
        >('/rider/earnings')
        .then((r) => r.data),
  });

  useEffect(() => {
    if (!navigator.geolocation) return;

    const sendLocation = (position: GeolocationPosition) => {
      api
        .post('/rider/location', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        .catch(() => undefined);
    };

    navigator.geolocation.getCurrentPosition(sendLocation);
    const id = navigator.geolocation.watchPosition(sendLocation, undefined, {
      enableHighAccuracy: true,
      maximumAge: 30000,
    });

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const pickup = async (uuid: string) => {
    await api.post(`/rider/deliveries/${uuid}/pickup`);
    queryClient.invalidateQueries({ queryKey: ['rider-deliveries'] });
  };

  const complete = async (uuid: string) => {
    await api.post(`/rider/deliveries/${uuid}/complete`);
    queryClient.invalidateQueries({ queryKey: ['rider-deliveries'] });
    queryClient.invalidateQueries({ queryKey: ['rider-earnings'] });
  };

  const allDeliveries = deliveries?.data ?? [];
  const activeDeliveries = allDeliveries.filter((d) => d.status !== 'delivered');
  const completedDeliveries = allDeliveries.filter((d) => d.status === 'delivered');
  const visibleDeliveries = tab === 'active' ? activeDeliveries : completedDeliveries;

  const earningsTrend = useMemo(() => {
    const byDate = new Map<string, { revenue: number; orders: number }>();
    completedDeliveries
      .filter((d) => d.delivered_at)
      .forEach((d) => {
        const date = (d.delivered_at as string).slice(0, 10);
        const entry = byDate.get(date) ?? { revenue: 0, orders: 0 };
        entry.revenue += d.earnings;
        entry.orders += 1;
        byDate.set(date, entry);
      });

    return Array.from(byDate.entries())
      .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [completedDeliveries]);

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="GPS location is shared automatically while this page is open."
      />

      {earnings?.data && (
        <StatGrid>
          <StatCard label="Today" value={formatCurrency(earnings.data.today_earnings)} icon={Wallet} tone="accent" />
          <StatCard
            label="Total earnings"
            value={formatCurrency(earnings.data.total_earnings)}
            icon={Wallet}
            tone="primary"
          />
          <StatCard label="Completed" value={earnings.data.completed_deliveries} icon={CheckCircle2} tone="primary" />
          <StatCard label="Active" value={activeDeliveries.length} icon={Truck} tone="primary" />
        </StatGrid>
      )}

      <DashboardCard className="mb-5">
        <DashboardCardHeader
          title="Earnings from completed deliveries"
          action={<CardMenu queryKey={['rider-deliveries']} />}
        />
        <DashboardCardContent>
          {earningsTrend.length > 0 ? (
            <RevenueChart data={earningsTrend} />
          ) : (
            <EmptyState icon={Wallet} title="No completed deliveries yet" />
          )}
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardContent className="pt-4">
          <div className="mb-5 flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {(['active', 'completed'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                  tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t} ({t === 'active' ? activeDeliveries.length : completedDeliveries.length})
              </button>
            ))}
          </div>

          {visibleDeliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title={tab === 'active' ? 'No active deliveries' : 'No completed deliveries yet'}
            />
          ) : (
            <ListShell>
              {visibleDeliveries.map((d) => (
                <ListRow key={d.uuid}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{d.order?.order_number}</p>
                        <StatusBadge status={d.status} />
                      </div>
                      {d.order?.shipping_address && (
                        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          {d.order.shipping_address.address_line_1}, {d.order.shipping_address.city}
                        </p>
                      )}
                      <div className="mt-2.5">
                        <DeliverySteps status={d.status} />
                      </div>
                      <div className="mt-2 flex gap-2">
                        {d.status === 'assigned' && (
                          <Button size="sm" onClick={() => pickup(d.uuid)}>
                            Mark picked up
                          </Button>
                        )}
                        {d.status === 'picked_up' && (
                          <Button size="sm" onClick={() => complete(d.uuid)}>
                            Mark delivered
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold">{formatCurrency(d.earnings)}</p>
                  </div>
                </ListRow>
              ))}
            </ListShell>
          )}
        </DashboardCardContent>
      </DashboardCard>
    </>
  );
}
