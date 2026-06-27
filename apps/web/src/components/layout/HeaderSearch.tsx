import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { buildProductFilterParams, parseProductFilters } from '@/lib/productFilters';

function searchTargetPath(pathname: string) {
  return pathname === '/' ? '/' : '/products';
}

export function HeaderSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSearchablePage = location.pathname === '/' || location.pathname === '/products';

  useEffect(() => {
    if (isSearchablePage) {
      setQuery(searchParams.get('q') ?? '');
    }
  }, [isSearchablePage, searchParams]);

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
    setMobileOpen(false);
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

  const searchField = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pr-9 pl-10"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:flex">
        <div className="w-full max-w-xl">{searchField}</div>
      </form>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Search products"
      >
        <Search className="h-5 w-5" />
      </Button>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-border bg-card px-4 py-3 shadow-sm md:hidden">
          <form onSubmit={submitSearch} className="flex gap-2">
            <div className="min-w-0 flex-1">{searchField}</div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
