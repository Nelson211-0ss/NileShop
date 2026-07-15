import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Ban, MoreHorizontal, RotateCcw, ShieldAlert, Trash2, Users } from 'lucide-react';
import type { User } from '@nileshop/types';
import { adminApi } from '@/lib/marketplaceApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

const PER_PAGE = 20;

function extractErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
  const firstFieldError = Object.values(err.response?.data?.errors ?? {})[0]?.[0];
  return firstFieldError ?? err.response?.data?.message ?? fallback;
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data } = useQuery({
    queryKey: ['admin-users', debouncedSearch, page],
    queryFn: () => adminApi.users(debouncedSearch || undefined, page),
  });

  const users = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const deactivate = useMutation({
    mutationFn: (uuid: string) => adminApi.deactivateUser(uuid),
    onSuccess: invalidateUsers,
    onError: (error) => setActionError(extractErrorMessage(error, 'Could not deactivate this account.')),
  });

  const reactivate = useMutation({
    mutationFn: (uuid: string) => adminApi.reactivateUser(uuid),
    onSuccess: invalidateUsers,
    onError: (error) => setActionError(extractErrorMessage(error, 'Could not reactivate this account.')),
  });

  const remove = useMutation({
    mutationFn: (uuid: string) => adminApi.deleteUser(uuid),
    onSuccess: () => {
      setUserToDelete(null);
      invalidateUsers();
    },
    onError: (error) => setActionError(extractErrorMessage(error, 'Could not delete this account.')),
  });

  return (
    <>
      <PageHeader
        title="Users"
        description="Search and review every account on the platform."
        actions={
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        }
      />

      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {actionError}
          <button type="button" onClick={() => setActionError(null)} className="font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <DashboardSection title={`${total} users`}>
        {users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Roles</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Verified</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => {
                    const isSelf = currentUser?.email === u.email;
                    const busy =
                      (deactivate.isPending && deactivate.variables === u.uuid) ||
                      (reactivate.isPending && reactivate.variables === u.uuid);

                    return (
                      <tr key={u.uuid}>
                        <td className="py-3 pr-4 font-medium">
                          {u.name}
                          {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.length ? (
                              u.roles.map((role) => (
                                <span
                                  key={role}
                                  className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs capitalize"
                                >
                                  {role.replace(/_/g, ' ')}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                              u.is_active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-muted text-muted-foreground',
                            )}
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                u.is_active ? 'bg-emerald-600' : 'bg-muted-foreground',
                              )}
                            />
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {u.email_verified ? (
                            <BadgeCheck className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                disabled={isSelf || busy}
                                aria-label="User actions"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {u.is_active ? (
                                <DropdownMenuItem onClick={() => deactivate.mutate(u.uuid)}>
                                  <Ban className="h-4 w-4 text-muted-foreground" />
                                  Deactivate account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => reactivate.mutate(u.uuid)}>
                                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                                  Reactivate account
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setUserToDelete(u)}
                                className="text-destructive data-[highlighted]:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination page={page} total={total} perPage={PER_PAGE} onPageChange={setPage} />
            </div>
          </>
        )}
      </DashboardSection>

      <Dialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Delete this account?
            </DialogTitle>
            <DialogDescription>
              This permanently deletes <strong>{userToDelete?.name}</strong> ({userToDelete?.email}). This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => userToDelete && remove.mutate(userToDelete.uuid)}
            >
              {remove.isPending ? 'Deleting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
