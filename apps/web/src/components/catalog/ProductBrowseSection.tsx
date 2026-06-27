import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '@/lib/marketplaceApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid';
import {
  ActiveFilterChips,
  ProductFiltersMobile,
  ProductFiltersSidebar,
  ProductFiltersToggle,
} from '@/components/catalog/ProductFilters';
import { buildProductFilterParams, countActiveFilters, parseProductFilters } from '@/lib/productFilters';
import { Button } from '@/components/ui/button';

interface ProductBrowseSectionProps {
  /** Page heading (products page). Omit on home — uses section title instead. */
  title?: string;
  /** Section title when embedded on home page */
  sectionTitle?: string;
  /** Show "View all on products page" link */
  showViewAllLink?: boolean;
  className?: string;
}

export function ProductBrowseSection({
  title,
  sectionTitle = 'Browse products',
  showViewAllLink = false,
  className,
}: ProductBrowseSectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(() => parseProductFilters(searchParams), [searchParams]);
  const apiParams = useMemo(() => buildProductFilterParams(filters), [filters]);
  const activeFilterCount = countActiveFilters(filters);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', apiParams],
    queryFn: () => productApi.list(apiParams),
  });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? products.length;
  const currentPage = data?.meta?.current_page ?? 1;
  const lastPage =
    data?.meta?.total && data.meta.per_page ? Math.ceil(data.meta.total / data.meta.per_page) : 1;

  const displayTitle = filters.q
    ? `Results for "${filters.q}"`
    : filters.is_featured === '1'
      ? 'Featured products'
      : title ?? sectionTitle;

  const setPage = (page: number) => {
    const params = new URLSearchParams(apiParams);
    params.set('page', String(page));
    setSearchParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewAllHref = `/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return (
    <section id="browse" className={className}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={title ? 'text-2xl font-bold tracking-tight' : 'text-xl font-bold tracking-tight'}>
            {displayTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? 'Loading…' : `${total} product${total === 1 ? '' : 's'}`}
            {isFetching && !isLoading ? ' · Updating…' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showViewAllLink && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={viewAllHref}>View all</Link>
            </Button>
          )}
          <ProductFiltersToggle activeCount={activeFilterCount} onClick={() => setFiltersOpen(true)} />
        </div>
      </div>

      <ActiveFilterChips />

      <div className="flex gap-8">
        <ProductFiltersSidebar />
        <ProductFiltersMobile open={filtersOpen} onClose={() => setFiltersOpen(false)} />

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products match your search or filters.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </ProductGrid>

              {lastPage > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-sm text-muted-foreground">
                    Page {currentPage} of {lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= lastPage}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
