import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Heart, Minus, Plus, ShoppingCart, Truck, Shield, Star } from 'lucide-react';
import { productApi, wishlistApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { useCartActions } from '@/hooks/useCart';
import { extractApiError } from '@/lib/apiErrors';
import { useAppSelector } from '@/store/hooks';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { addItem } = useCartActions();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.get(slug!),
    enabled: !!slug,
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="page-container py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!product) {
    return <div className="page-container py-12">Product not found.</div>;
  }

  const images = product.images ?? [];
  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : 0;

  const addToCart = async (redirectToCheckout = false) => {
    if (redirectToCheckout && !isAuthenticated) {
      navigate('/auth/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    setError(null);
    redirectToCheckout ? setBuying(true) : setAdding(true);

    try {
      await addItem(product.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (redirectToCheckout) {
        navigate('/checkout');
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setAdding(false);
      setBuying(false);
    }
  };

  return (
    <div className="page-container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImageGallery images={images} name={product.name} />
        <div>
          {product.vendor && (
            <p className="mb-2 text-sm text-muted-foreground">{product.vendor.store_name}</p>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span>
              {product.rating} ({product.total_reviews} reviews)
            </span>
            <span className="text-muted-foreground">· {product.total_sales} sold</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            {product.compare_price && (
              <span className="text-xl text-muted-foreground line-through">
                {formatCurrency(product.compare_price)}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-lg bg-destructive/10 px-2 py-1 text-sm font-bold text-destructive">
                -{discount}%
              </span>
            )}
          </div>
          <p className="mt-4 text-muted-foreground">{product.short_description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4" /> Fast delivery
            </span>
            {product.warranty && (
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" /> {product.warranty}
              </span>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          {added && (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Added to cart ·{' '}
              <Link to="/cart" className="underline">
                View cart
              </Link>
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={qty >= product.stock}
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" onClick={() => addToCart(false)} disabled={adding || buying || product.stock === 0}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {adding ? 'Adding…' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => addToCart(true)}
              disabled={adding || buying || product.stock === 0}
            >
              {buying ? 'Processing…' : 'Buy now'}
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
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
