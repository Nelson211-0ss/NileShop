import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/marketplaceApi';
import {
  buildProductFilterParams,
  countActiveFilters,
  parseProductFilters,
  type ProductBrowseFilters,
} from '@/lib/productFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest' },
  { value: 'total_sales:desc', label: 'Best selling' },
  { value: 'rating:desc', label: 'Top rated' },
  { value: 'price:asc', label: 'Price: low to high' },
  { value: 'price:desc', label: 'Price: high to low' },
  { value: 'name:asc', label: 'Name: A–Z' },
];

interface ProductFiltersProps {
  className?: string;
  onClose?: () => void;
}

function FilterPanel({ className, onClose }: ProductFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseProductFilters(searchParams), [searchParams]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.categories,
  });
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: catalogApi.brands,
  });

  const categories = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];

  const sortValue = `${filters.sort ?? 'created_at'}:${filters.direction ?? 'desc'}`;

  const applyFilters = (next: ProductBrowseFilters) => {
    const params = new URLSearchParams(buildProductFilterParams(next));
    setSearchParams(params, { replace: true });
  };

  const updateFilter = (patch: Partial<ProductBrowseFilters>) => {
    applyFilters({ ...filters, ...patch });
  };

  const clearFilters = () => {
    const q = filters.q;
    applyFilters(q ? { q } : {});
    onClose?.();
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {countActiveFilters(filters) > 0 && (
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort">Sort by</Label>
        <select
          id="sort"
          value={sortValue}
          onChange={(e) => {
            const [sort, direction] = e.target.value.split(':');
            updateFilter({ sort, direction });
          }}
          className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={filters.category_id ?? ''}
          onChange={(e) => updateFilter({ category_id: e.target.value || undefined })}
          className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <select
          id="brand"
          value={filters.brand_id ?? ''}
          onChange={(e) => updateFilter({ brand_id: e.target.value || undefined })}
          className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Price range (SSP)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.min_price ?? ''}
            onChange={(e) => updateFilter({ min_price: e.target.value || undefined })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.max_price ?? ''}
            onChange={(e) => updateFilter({ max_price: e.target.value || undefined })}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.is_featured === '1'}
          onChange={(e) => updateFilter({ is_featured: e.target.checked ? '1' : undefined })}
          className="rounded border-border"
        />
        Featured products only
      </label>

      {onClose && (
        <Button type="button" className="w-full lg:hidden" onClick={onClose}>
          Show results
        </Button>
      )}
    </div>
  );
}

export function ProductFiltersSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
        <FilterPanel />
      </div>
    </aside>
  );
}

export function ProductFiltersMobile({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close filters"
        className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card shadow-lg lg:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-semibold">Filters</span>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <FilterPanel onClose={onClose} />
        </div>
      </div>
    </>
  );
}

export function ProductFiltersToggle({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="outline" size="sm" className="lg:hidden" onClick={onClick}>
      <SlidersHorizontal className="mr-2 h-4 w-4" />
      Filters
      {activeCount > 0 && (
        <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
          {activeCount}
        </span>
      )}
    </Button>
  );
}

export function ActiveFilterChips() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseProductFilters(searchParams), [searchParams]);

  const chips: { key: string; label: string; clear: () => void }[] = [];

  if (filters.q) {
    chips.push({
      key: 'q',
      label: `"${filters.q}"`,
      clear: () => {
        const next = { ...filters };
        delete next.q;
        setSearchParams(new URLSearchParams(buildProductFilterParams(next)), { replace: true });
      },
    });
  }
  if (filters.category_id) {
    chips.push({
      key: 'category',
      label: 'Category',
      clear: () => updateChip(filters, 'category_id', setSearchParams),
    });
  }
  if (filters.brand_id) {
    chips.push({
      key: 'brand',
      label: 'Brand',
      clear: () => updateChip(filters, 'brand_id', setSearchParams),
    });
  }
  if (filters.min_price || filters.max_price) {
    chips.push({
      key: 'price',
      label: 'Price',
      clear: () => {
        const next = { ...filters };
        delete next.min_price;
        delete next.max_price;
        setSearchParams(new URLSearchParams(buildProductFilterParams(next)), { replace: true });
      },
    });
  }
  if (filters.is_featured === '1') {
    chips.push({
      key: 'featured',
      label: 'Featured',
      clear: () => updateChip(filters, 'is_featured', setSearchParams),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium hover:bg-muted"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

function updateChip(
  filters: ProductBrowseFilters,
  key: keyof ProductBrowseFilters,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
) {
  const next = { ...filters };
  delete next[key];
  setSearchParams(new URLSearchParams(buildProductFilterParams(next)), { replace: true });
}
