import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { buildProductFilterParams, parseProductFilters } from '@/lib/productFilters';
import { cn } from '@/lib/utils';

function searchTargetPath(pathname: string) {
  return pathname === '/' ? '/' : '/products';
}

interface HeaderSearchProps {
  className?: string;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function HeaderSearch({ className, mobileOpen, onMobileOpenChange }: HeaderSearchProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const isSearchablePage = location.pathname === '/' || location.pathname === '/products';

  useEffect(() => {
    if (isSearchablePage) {
      setQuery(searchParams.get('q') ?? '');
    }
  }, [isSearchablePage, searchParams]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    onMobileOpenChange(false);
  }, [location.pathname, onMobileOpenChange]);

  const navigateWithFilters = (params: URLSearchParams) => {
    const path = searchTargetPath(location.pathname);
    const qs = params.toString();
    const hash = path === '/' ? '#browse' : '';
    navigate(`${path}${qs ? `?${qs}` : ''}${hash}`);
  };

  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    const current = isSearchablePage ? parseProductFilters(searchParams) : {};

    const next = buildProductFilterParams({ ...current, q: q || undefined });
    const params = new URLSearchParams(next);

    if (location.pathname === '/') {
      navigateWithFilters(params);
    } else {
      navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
    }
    onMobileOpenChange(false);
  };

  const clearSearch = () => {
    setQuery('');
    const current = isSearchablePage ? parseProductFilters(searchParams) : {};
    delete current.q;
    const params = new URLSearchParams(buildProductFilterParams(current));

    if (location.pathname === '/') {
      navigateWithFilters(params);
    } else {
      navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
    }
  };

  const searchBar = (
    <div className="flex w-full items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
      <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <Button type="submit" size="sm" className="mr-1 h-8 shrink-0 rounded-md px-3">
        Search
      </Button>
    </div>
  );

  return (
    <div className={cn('relative min-w-0', className)}>
      <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block">
        <div className="max-w-xl">{searchBar}</div>
      </form>

      <div className="flex flex-1 justify-end md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onMobileOpenChange(!mobileOpen)}
          aria-label={mobileOpen ? 'Close search' : 'Search products'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close search"
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => onMobileOpenChange(false)}
          />
          <div className="fixed inset-x-0 top-14 z-50 border-b border-border bg-card px-4 py-3 shadow-sm sm:top-16 md:hidden">
            <form onSubmit={submitSearch}>{searchBar}</form>
          </div>
        </>
      )}
    </div>
  );
}
