import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@nileshop/types';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { cartApi } from '@/lib/marketplaceApi';
import { setCart } from '@/store/cartSlice';
import { useAppDispatch } from '@/store/hooks';

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const image = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await cartApi.add(product.id, 1);
    if (res.data) dispatch(setCart(res.data));
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="relative aspect-square bg-muted">
          {image ? (
            <img
              src={image.url}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/seed/${product.slug}/400/500`;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-[10px]">No image</div>
          )}
          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
          <Button
            size="icon"
            className="absolute bottom-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1.5 py-1">
          {product.vendor && (
            <p className="text-[9px] text-muted-foreground truncate">{product.vendor.store_name}</p>
          )}
          <h3 className="text-[11px] font-medium line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-accent text-accent shrink-0" />
            <span className="text-[9px] text-muted-foreground">{product.rating}</span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1 flex-wrap">
            <span className="text-xs font-bold">{formatCurrency(product.price)}</span>
            {product.compare_price && (
              <span className="text-[9px] text-muted-foreground line-through">{formatCurrency(product.compare_price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
