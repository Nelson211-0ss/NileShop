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

  const searchField = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-10 pr-9 pl-10"
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
    <div className={cn('relative min-w-0', className)}>
      <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:flex">
        <div className="w-full max-w-xl">{searchField}</div>
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
            <form onSubmit={submitSearch} className="flex gap-2">
              <div className="min-w-0 flex-1">{searchField}</div>
              <Button type="submit" size="sm" className="shrink-0">
                Search
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
