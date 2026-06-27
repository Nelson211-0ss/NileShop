import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { wishlistApi } from '@/lib/marketplaceApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';

export function WishlistPage() {
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: wishlistApi.list });
  const products = data?.data ?? [];

  return (
    <>
      <PageHeader title="Wishlist" description="Products you've saved for later." />

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Browse products and save the ones you like."
          action={
            <Button asChild size="sm">
              <Link to="/products">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <ProductGrid>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ProductGrid>
      )}
    </>
  );
}
