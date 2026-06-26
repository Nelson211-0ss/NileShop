import { useQuery } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/marketplaceApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid';

export function WishlistPage() {
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: wishlistApi.list });
  const products = data?.data ?? [];

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {isLoading ? <ProductGridSkeleton count={4} /> : products.length === 0 ? (
        <p className="text-muted-foreground">No items in wishlist.</p>
      ) : (
        <ProductGrid>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </ProductGrid>
      )}
    </div>
  );
}
