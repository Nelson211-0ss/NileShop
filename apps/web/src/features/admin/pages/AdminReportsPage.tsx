import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Package, ShoppingBag } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { StatCard, StatGrid } from '@/components/dashboard/StatCard';
import { TopProductsChart } from '@/components/dashboard/TopProductsChart';

const RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export function AdminReportsPage() {
  const [days, setDays] = useState(30);

  const { data } = useQuery({
    queryKey: ['admin-reports', days],
    queryFn: () => adminApi.reports(days),
  });

  const report = data?.data;

  return (
    <>
      <PageHeader
        title="Reports"
        description="Sales performance and top-selling products."
        actions={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDays(r.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  days === r.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {report && (
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-2">
          <StatCard label="Revenue" value={formatCurrency(report.total_revenue)} icon={Package} />
          <StatCard label="Orders" value={report.total_orders} icon={ShoppingBag} />
        </StatGrid>
      )}

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base">Revenue trend</CardTitle>
        </CardHeader>
        <CardContent>
          {report?.daily_sales?.length ? (
            <RevenueChart data={report.daily_sales} height={300} />
          ) : (
            <EmptyState icon={BarChart3} title="No sales in this period" />
          )}
        </CardContent>
      </Card>

      <DashboardSection title="Top products">
        {report?.top_products?.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <TopProductsChart data={report.top_products} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 text-right font-medium">Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.top_products.map((p) => (
                    <tr key={p.name}>
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatCurrency(p.price)}</td>
                      <td className="py-3 text-right">{p.total_sales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState icon={Package} title="No product sales data" />
        )}
      </DashboardSection>
    </>
  );
}
