import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { cartApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { setCart } from '@/store/cartSlice';

export function CartPage() {
  const dispatch = useAppDispatch();
  const { data, refetch } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const cart = data?.data;

  useEffect(() => {
    if (cart) dispatch(setCart(cart));
  }, [cart, dispatch]);

  const updateQty = async (itemId: number, quantity: number) => {
    const res = await cartApi.update(itemId, quantity);
    if (res.data) dispatch(setCart(res.data));
    refetch();
  };

  const remove = async (itemId: number) => {
    const res = await cartApi.remove(itemId);
    if (res.data) dispatch(setCart(res.data));
    refetch();
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button asChild><Link to="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.item_count} items)</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-border p-4">
              <div className="h-20 w-20 rounded-xl bg-muted shrink-0 overflow-hidden">
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link to={`/products/${item.product?.slug}`} className="font-medium hover:text-primary">
                  {item.product?.name}
                </Link>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" min={1} value={item.quantity}
                    onChange={(e) => updateQty(item.id, +e.target.value)}
                    className="w-16 rounded border border-border px-2 py-1 text-center text-sm" />
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="font-bold">{formatCurrency(item.total)}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span><span>{formatCurrency(cart.subtotal)}</span>
            </div>
          </div>
          <Button className="w-full mt-6" size="lg" asChild>
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
