import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, LayoutGrid, SlidersHorizontal, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { catalogApi } from '@/lib/marketplaceApi';
import { resolveCategoryIcon } from '@/lib/categoryIcon';
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

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryRow({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof LayoutGrid;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
        active ? 'bg-accent/10 font-semibold text-accent' : 'text-foreground hover:bg-muted',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : 'text-muted-foreground')} strokeWidth={1.9} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
    </button>
  );
}

function FeaturedToggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-muted',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={cn(
          'inline-block h-4.5 w-4.5 rounded-full bg-white shadow',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
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
    <div className={cn('divide-y-0', className)}>
      <div className="flex items-center justify-between pb-3">
        <span className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          Filters
        </span>
        {countActiveFilters(filters) > 0 && (
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <FilterSection title="Sort by">
        <select
          id="sort"
          value={sortValue}
          onChange={(e) => {
            const [sort, direction] = e.target.value.split(':');
            updateFilter({ sort, direction });
          }}
          className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Category">
        <div className="max-h-72 space-y-0.5 overflow-y-auto">
          <CategoryRow
            active={!filters.category_id}
            label="All categories"
            icon={LayoutGrid}
            onClick={() => updateFilter({ category_id: undefined })}
          />
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              active={filters.category_id === String(cat.id)}
              label={cat.name}
              icon={resolveCategoryIcon(cat.icon)}
              onClick={() => updateFilter({ category_id: String(cat.id) })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brand" defaultOpen={false}>
        <select
          id="brand"
          value={filters.brand_id ?? ''}
          onChange={(e) => updateFilter({ brand_id: e.target.value || undefined })}
          className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Price range (SSP)">
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              SSP
            </span>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={filters.min_price ?? ''}
              onChange={(e) => updateFilter({ min_price: e.target.value || undefined })}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              SSP
            </span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={filters.max_price ?? ''}
              onChange={(e) => updateFilter({ max_price: e.target.value || undefined })}
              className="pl-10"
            />
          </div>
        </div>
      </FilterSection>

      <div className="flex items-center justify-between py-4">
        <Label htmlFor="featured-toggle" className="cursor-pointer text-sm font-medium text-foreground">
          Featured products only
        </Label>
        <FeaturedToggle
          checked={filters.is_featured === '1'}
          onChange={(next) => updateFilter({ is_featured: next ? '1' : undefined })}
        />
      </div>

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
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 rounded-xl border border-border bg-card p-4 shadow-sm">
        <FilterPanel />
      </div>
    </aside>
  );
}

export function ProductFiltersMobile({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card shadow-lg lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-semibold">Filters</span>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
