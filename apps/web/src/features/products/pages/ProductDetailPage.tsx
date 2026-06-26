import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, ShoppingCart, Heart, Truck, Shield } from 'lucide-react';
import { productApi, cartApi, wishlistApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { setCart } from '@/store/cartSlice';
import { useState } from 'react';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.get(slug!),
    enabled: !!slug,
  });

  const product = data?.data;

  if (isLoading) return <div className="page-container py-12"><div className="h-96 bg-muted rounded-2xl animate-pulse" /></div>;
  if (!product) return <div className="page-container py-12">Product not found.</div>;

  const image = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;

  const addToCart = async () => {
    setAdding(true);
    try {
      const res = await cartApi.add(product.id, qty);
      if (res.data) dispatch(setCart(res.data));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="page-container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
          {image ? <img src={image.url} alt={product.name} className="h-full w-full object-cover" /> : null}
        </div>
        <div>
          {product.vendor && <p className="text-sm text-muted-foreground mb-2">{product.vendor.store_name}</p>}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span>{product.rating} ({product.total_reviews} reviews)</span>
            <span className="text-muted-foreground">· {product.total_sales} sold</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            {product.compare_price && <span className="text-xl text-muted-foreground line-through">{formatCurrency(product.compare_price)}</span>}
            {discount > 0 && <span className="rounded-lg bg-destructive/10 px-2 py-1 text-sm font-bold text-destructive">-{discount}%</span>}
          </div>
          <p className="mt-4 text-muted-foreground">{product.short_description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Fast delivery</span>
            {product.warranty && <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> {product.warranty}</span>}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <input type="number" min={1} max={product.stock} value={qty} onChange={(e) => setQty(+e.target.value)}
              className="w-20 rounded-lg border border-border px-3 py-2 text-center" />
            <Button size="lg" onClick={addToCart} disabled={adding || product.stock === 0}>
              <ShoppingCart className="mr-2 h-5 w-5" />{adding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="outline" onClick={() => wishlistApi.add(product.id)}>
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="mt-2 text-sm text-destructive">Only {product.stock} left in stock!</p>
          )}
          {product.description && (
            <div className="mt-8">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
