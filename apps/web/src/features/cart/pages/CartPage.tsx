import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { useCartActions } from '@/hooks/useCart';
import { extractApiError } from '@/lib/apiErrors';
import { useAppSelector } from '@/store/hooks';

export function CartPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { updateItem, removeItem } = useCartActions();
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const cart = data?.data;

  const changeQty = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setError(null);
    setUpdatingId(itemId);
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const remove = async (itemId: number) => {
    setError(null);
    setUpdatingId(itemId);
    try {
      await removeItem(itemId);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="page-container py-12"><div className="h-48 animate-pulse rounded-lg bg-muted" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-container py-16 text-center">
        <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-6 text-muted-foreground">Browse products and add items to get started.</p>
        <Button asChild><Link to="/products">Browse products</Link></Button>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <h1 className="mb-6 text-2xl font-bold">Shopping cart ({cart.item_count} items)</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/products/${item.product?.slug}`} className="font-medium hover:text-primary">
                  {item.product?.name}
                </Link>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={updatingId === item.id || item.quantity <= 1}
                    onClick={() => changeQty(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={updatingId === item.id}
                    onClick={() => changeQty(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={updatingId === item.id}
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="font-semibold">{formatCurrency(item.total)}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-4 font-semibold">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and tax calculated at checkout.</p>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" size="lg" asChild>
            <Link to={isAuthenticated ? '/checkout' : '/auth/login'} state={isAuthenticated ? undefined : { from: { pathname: '/checkout' } }}>
              {isAuthenticated ? 'Proceed to checkout' : 'Sign in to checkout'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
