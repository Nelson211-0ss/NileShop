import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Cart } from '@nileshop/types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
}

const initialState: CartState = { cart: null, isLoading: false };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart | null>) => {
      state.cart = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearCart: (state) => {
      state.cart = null;
    },
  },
});

export const { setCart, setLoading, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
