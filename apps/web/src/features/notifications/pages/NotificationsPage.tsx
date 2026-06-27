import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
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
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up. New updates will appear here."
        />
      ) : (
        <ListShell>
          {notifications.map((n) => (
            <ListRow key={n.id}>
              <p className={`text-sm ${n.read_at ? 'text-muted-foreground' : 'font-medium'}`}>{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              {!n.read_at && (
                <Button size="sm" variant="ghost" className="mt-1 h-8 px-0" onClick={() => markRead.mutate(n.id)}>
                  Mark read
                </Button>
              )}
            </ListRow>
          ))}
        </ListShell>
      )}
    </>
  );
}
