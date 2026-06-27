import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface Notification {
  id: string;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<ApiResponse<Notification[]>>('/notifications').then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data ?? [];

  return (
    <>
      <PageHeader title="Notifications" description="Updates about your orders and account." />

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up. New updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 ${
                n.read_at ? 'border-border bg-background' : 'border-foreground/15 bg-muted/40'
              }`}
            >
              <p className="text-sm">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              {!n.read_at && (
                <Button size="sm" variant="ghost" className="mt-2 h-8 px-2" onClick={() => markRead.mutate(n.id)}>
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
