import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Store } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { cn } from '@/lib/utils';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard, StatGrid } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const ALL_VENDORS_PER_PAGE = 500;

export function AdminVendorLocationsPage() {
  const { data } = useQuery({
    queryKey: ['admin-vendor-locations'],
    queryFn: () => adminApi.vendors(undefined, 1, ALL_VENDORS_PER_PAGE),
  });

  const vendors = data?.data ?? [];

  const cityGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of data?.data ?? []) {
      const key = v.city?.trim() || 'Unknown';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const maxCount = cityGroups[0]?.[1] ?? 1;

  const sortedVendors = useMemo(
    () =>
      [...(data?.data ?? [])].sort((a, b) => (a.city ?? 'Unknown').localeCompare(b.city ?? 'Unknown')),
    [data],
  );

  return (
    <>
      <PageHeader
        title="Vendor locations"
        description="Where vendor stores are based across the platform."
      />

      <StatGrid className="sm:grid-cols-2 lg:grid-cols-2">
        <StatCard label="Vendors" value={vendors.length} icon={Store} />
        <StatCard label="Cities covered" value={cityGroups.length} icon={MapPin} />
      </StatGrid>

      <DashboardSection title="Vendors by city">
        {cityGroups.length === 0 ? (
          <EmptyState icon={MapPin} title="No vendor location data yet" />
        ) : (
          <div className="space-y-3">
            {cityGroups.map(([city, count]) => (
              <div key={city} className="flex items-center gap-3">
                <p className="w-32 shrink-0 truncate text-sm font-medium">{city}</p>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full bg-primary')}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <p className="w-10 shrink-0 text-right text-sm text-muted-foreground">{count}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      <div className="mt-10">
        <DashboardSection title="All vendors">
          {sortedVendors.length === 0 ? (
            <EmptyState icon={Store} title="No vendors found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Store</th>
                    <th className="pb-3 font-medium">Address</th>
                    <th className="pb-3 font-medium">City</th>
                    <th className="pb-3 font-medium">Country</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedVendors.map((v) => (
                    <tr key={v.id}>
                      <td className="py-3 pr-4 font-medium">{v.store_name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{v.address ?? '—'}</td>
                      <td className="py-3 pr-4">{v.city ?? 'Unknown'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{v.country}</td>
                      <td className="py-3">
                        <StatusBadge status={v.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>
      </div>
    </>
  );
}
