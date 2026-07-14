import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Users } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { Input } from '@/components/ui/input';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';

const PER_PAGE = 20;

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

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

      <DashboardSection title={`${total} users`}>
        {users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Roles</th>
                    <th className="pb-3 font-medium">Verified</th>
                    <th className="pb-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.uuid}>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
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
                        {u.email_verified ? (
                          <BadgeCheck className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination page={page} total={total} perPage={PER_PAGE} onPageChange={setPage} />
            </div>
          </>
        )}
      </DashboardSection>
    </>
  );
}
