import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/marketplaceApi';
import { clearCart, setCart } from '@/store/cartSlice';
import { useAppDispatch } from '@/store/hooks';

export function useCartActions() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const applyCartResponse = useCallback(
    (res: Awaited<ReturnType<typeof cartApi.get>>) => {
      dispatch(setCart(res.data ?? null));
      queryClient.setQueryData(['cart'], res);
      return res.data ?? null;
    },
    [dispatch, queryClient],
  );

  const syncCart = useCallback(async () => {
    const res = await cartApi.get();
    return applyCartResponse(res);
  }, [applyCartResponse]);

  const addItem = useCallback(
    async (productId: number, quantity = 1, variantId?: number) => {
      const res = await cartApi.add(productId, quantity, variantId);
      applyCartResponse(res);
      return res;
    },
    [applyCartResponse],
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      const res = await cartApi.update(itemId, quantity);
      applyCartResponse(res);
      return res;
    },
    [applyCartResponse],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      const res = await cartApi.remove(itemId);
      applyCartResponse(res);
      return res;
    },
    [applyCartResponse],
  );

  const resetCart = useCallback(() => {
    dispatch(clearCart());
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [dispatch, queryClient]);

  return { syncCart, addItem, updateItem, removeItem, resetCart };
}
