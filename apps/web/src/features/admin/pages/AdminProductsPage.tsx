import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Select } from '@/components/ui/select';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Pagination } from '@/components/dashboard/Pagination';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const PRODUCT_STATUSES = ['draft', 'published', 'archived'];
const PER_PAGE = 20;

export function AdminProductsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin-products', status, page],
    queryFn: () => adminApi.products(status || undefined, page),
  });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Products"
        description="Browse and moderate the platform's product catalog."
        actions={
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-auto min-w-40"
          >
            <option value="">All statuses</option>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </Select>
        }
      />

      <DashboardSection title={`${total} products`}>
        {products.length === 0 ? (
          <EmptyState icon={Package} title="No products found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Vendor</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="py-3 pr-4 font-medium">{product.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{product.vendor?.store_name ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{product.category?.name ?? '—'}</td>
                      <td className="py-3 pr-4">{formatCurrency(product.price)}</td>
                      <td className="py-3 pr-4">{product.stock}</td>
                      <td className="py-3">
                        <StatusBadge status={product.status} />
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
