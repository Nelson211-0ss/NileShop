import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Store } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];
const PER_PAGE = 20;

export function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin-vendors', status, page],
    queryFn: () => adminApi.vendors(status || undefined, page),
  });

  const vendors = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });

  return (
    <>
      <PageHeader title="Vendors" description="Review store applications and manage vendor status." />

      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              status === tab.value
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DashboardSection title={`${total} vendors`}>
        {vendors.length === 0 ? (
          <EmptyState icon={Store} title="No vendors found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Store</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Rating</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td className="py-3 pr-4 font-medium">{v.store_name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{v.city ?? v.country}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {v.rating ? `${v.rating.toFixed(1)} (${v.total_reviews})` : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="py-3 text-right">
                        {v.status === 'pending' && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" onClick={() => adminApi.approveVendor(v.id).then(invalidate)}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => adminApi.rejectVendor(v.id).then(invalidate)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
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
