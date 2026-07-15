import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { buildProductFilterParams, parseProductFilters } from '@/lib/productFilters';
import { cn } from '@/lib/utils';

function searchTargetPath(pathname: string) {
  return pathname === '/' ? '/' : '/products';
}

function useSearchState() {
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

  const navigateWithFilters = (params: URLSearchParams) => {
    const path = searchTargetPath(location.pathname);
    const qs = params.toString();
    const hash = path === '/' ? '#browse' : '';
    navigate(`${path}${qs ? `?${qs}` : ''}${hash}`);
  };

  const submitSearch = (onDone?: () => void) => (e?: FormEvent) => {
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
    onDone?.();
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

  return { query, setQuery, submitSearch, clearSearch };
}

interface HeaderSearchProps {
  variant: 'desktop' | 'trigger' | 'expanded';
  className?: string;
  /** 'expanded' only — whether this bar is the currently visible one, used to autofocus. */
  active?: boolean;
  /** 'trigger' only — open the expanded mobile search. */
  onOpen?: () => void;
  /** 'expanded' only — collapse back to the trigger. */
  onClose?: () => void;
}

export function HeaderSearch({ variant, className, active, onOpen, onClose }: HeaderSearchProps) {
  const { query, setQuery, submitSearch, clearSearch } = useSearchState();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (variant === 'expanded' && active) {
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(focusTimer);
    }
  }, [variant, active]);

  if (variant === 'trigger') {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label="Search products"
        className={cn(
          'flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-left text-sm text-muted-foreground shadow-sm transition-transform active:scale-[0.98]',
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">{query || 'Search products...'}</span>
      </button>
    );
  }

  if (variant === 'expanded') {
    return (
      <form onSubmit={submitSearch(onClose)} className={cn('flex items-center gap-2', className)}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-accent">
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-foreground shadow-none focus-visible:ring-0"
            placeholder="Search products, brands and categories"
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
        </div>
        <Button type="submit" size="sm" className="h-10 shrink-0 rounded-lg bg-accent px-3 text-white hover:bg-accent/90">
          <Search className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submitSearch()} className={cn('min-w-0', className)}>
      <div className="flex h-11 w-full items-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-accent">
        <Search className="ml-3.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          className="h-11 min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-foreground shadow-none focus-visible:ring-0"
          placeholder="Search products, brands and categories"
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
        <Button
          type="submit"
          size="sm"
          className="h-11 shrink-0 rounded-none rounded-r-lg bg-accent px-5 text-white hover:bg-accent/90"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
