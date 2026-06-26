import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@nileshop/types';
import { Button } from '@/components/ui/button';
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
    queryFn: () => api.get<ApiResponse<{ total_earnings: number; today_earnings: number; completed_deliveries: number }>>('/rider/earnings').then((r) => r.data),
  });

  useEffect(() => {
    if (!navigator.geolocation) return;

    const sendLocation = (position: GeolocationPosition) => {
      api.post('/rider/location', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }).catch(() => undefined);
    };

    navigator.geolocation.getCurrentPosition(sendLocation);
    const id = navigator.geolocation.watchPosition(sendLocation, undefined, { enableHighAccuracy: true, maximumAge: 30000 });

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
    <div className="page-container py-6">
      <h1 className="text-xl font-bold mb-4">Rider Dashboard</h1>

      {earnings?.data && (
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-xl font-bold">{formatCurrency(earnings.data.today_earnings)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Earnings</p>
            <p className="text-xl font-bold">{formatCurrency(earnings.data.total_earnings)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-xl font-bold">{earnings.data.completed_deliveries}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-3">GPS location is shared automatically while this page is open.</p>

      <h2 className="font-semibold text-sm mb-3">Assigned Deliveries</h2>
      <div className="space-y-3">
        {deliveries?.data?.map((d) => (
          <div key={d.uuid} className="rounded-lg border p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{d.order?.order_number}</p>
                <p className="text-xs text-muted-foreground capitalize">{d.status}</p>
                {d.order?.shipping_address && (
                  <p className="text-xs mt-1">{d.order.shipping_address.address_line_1}, {d.order.shipping_address.city}</p>
                )}
              </div>
              <p className="font-bold text-sm">{formatCurrency(d.earnings)}</p>
            </div>
            <div className="flex gap-2 mt-2">
              {d.status === 'assigned' && (
                <Button size="sm" onClick={() => pickup(d.uuid)}>Mark Picked Up</Button>
              )}
              {d.status === 'picked_up' && (
                <Button size="sm" onClick={() => complete(d.uuid)}>Mark Delivered</Button>
              )}
            </div>
          </div>
        ))}
        {deliveries?.data?.length === 0 && <p className="text-sm text-muted-foreground">No active deliveries.</p>}
      </div>
    </div>
  );
}
