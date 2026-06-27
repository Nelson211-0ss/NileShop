import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '@nileshop/types';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { useCartActions } from '@/hooks/useCart';
import { extractApiError } from '@/lib/apiErrors';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartActions();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const image = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) return;

    setAdding(true);
    setError(null);

    try {
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(extractApiError(err));
      setTimeout(() => setError(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          {image ? (
            <img
              src={image.url}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1472851293608-84c544544556?auto=format&fit=crop&w=400&h=500&q=80';
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              No image
            </div>
          )}
          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
          {added && (
            <span className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white">
              <CheckCircle2 className="h-3 w-3" /> Added
            </span>
          )}
          {error && (
            <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-destructive px-2 py-1 text-[10px] text-white">
              {error}
            </span>
          )}
          <Button
            size="icon"
            className="absolute bottom-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            disabled={adding || product.stock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1.5 py-1">
          {product.vendor && (
            <p className="truncate text-[9px] text-muted-foreground">{product.vendor.store_name}</p>
          )}
          <h3 className="line-clamp-1 text-[11px] font-medium leading-tight transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 shrink-0 fill-accent text-accent" />
            <span className="text-[9px] text-muted-foreground">{product.rating}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-1">
            <span className="text-xs font-bold">{formatCurrency(product.price)}</span>
            {product.compare_price && (
              <span className="text-[9px] text-muted-foreground line-through">
                {formatCurrency(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
