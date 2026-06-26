import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '@/lib/marketplaceApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid';

export function ProductsPage() {
  const [params] = useSearchParams();
  const filters: Record<string, string> = {};
  params.forEach((v, k) => { filters[k] = v; });

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.list(filters),
  });

  const products = data?.data ?? [];
  const title = filters.q ? `Results for "${filters.q}"` : 'All Products';

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {isLoading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <ProductGrid>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </ProductGrid>
      )}
    </div>
  );
}
