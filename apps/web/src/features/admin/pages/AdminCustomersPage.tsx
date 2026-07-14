import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCheck } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Input } from '@/components/ui/input';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';

const PER_PAGE = 20;

export function AdminCustomersPage() {
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
    queryKey: ['admin-customers', debouncedSearch, page],
    queryFn: () => adminApi.customers(debouncedSearch || undefined, page),
  });

  const customers = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Customers"
        description="Order activity and spend across every customer on the platform."
        actions={
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        }
      />

      <DashboardSection title={`${total} customers`}>
        {customers.length === 0 ? (
          <EmptyState icon={UserCheck} title="No customers found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 text-right font-medium">Orders</th>
                    <th className="pb-3 text-right font-medium">Total spent</th>
                    <th className="pb-3 font-medium">Last order</th>
                    <th className="pb-3 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => (
                    <tr key={c.uuid}>
                      <td className="py-3 pr-4 font-medium">{c.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{c.email}</td>
                      <td className="py-3 pr-4 text-right">{c.order_count}</td>
                      <td className="py-3 pr-4 text-right font-semibold">{formatCurrency(c.total_spent)}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {c.last_login_at ? new Date(c.last_login_at).toLocaleDateString() : '—'}
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
