import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, MapPin, Truck, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatCurrency } from '@nileshop/utils';

interface Delivery {
  uuid: string;
  status: string;
  earnings: number;
  order?: { order_number: string; shipping_address?: Record<string, string> };
}

export function RiderDashboardPage() {
  const queryClient = useQueryClient();
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

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="GPS location is shared automatically while this page is open."
      />

      {earnings?.data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Today's earnings"
            value={formatCurrency(earnings.data.today_earnings)}
            icon={Wallet}
          />
          <StatCard
            label="Total earnings"
            value={formatCurrency(earnings.data.total_earnings)}
            icon={Wallet}
          />
          <StatCard
            label="Completed"
            value={earnings.data.completed_deliveries}
            icon={CheckCircle2}
          />
        </div>
      )}

      <DashboardSection title="Assigned deliveries" description="Pick up and complete active orders.">
        {deliveries?.data?.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No active deliveries"
            description="New assignments will appear here when available."
          />
        ) : (
          <div className="space-y-3">
            {deliveries?.data?.map((d) => (
              <div key={d.uuid} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{d.order?.order_number}</p>
                      <StatusBadge status={d.status} />
                    </div>
                    {d.order?.shipping_address && (
                      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        {d.order.shipping_address.address_line_1}, {d.order.shipping_address.city}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">{formatCurrency(d.earnings)}</p>
                </div>
                <div className="mt-3 flex gap-2">
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
            ))}
          </div>
        )}
      </DashboardSection>
    </>
  );
}
