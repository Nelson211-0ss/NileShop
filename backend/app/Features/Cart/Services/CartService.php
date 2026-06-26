<?php

namespace App\Features\Cart\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function getOrCreateCart(?User $user = null, ?string $sessionId = null): Cart
    {
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id], ['currency' => $user->currency ?? 'SSP']);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId], ['currency' => 'SSP']);
    }

    public function addItem(Cart $cart, int $productId, int $quantity = 1, ?int $variantId = null): CartItem
    {
        $product = Product::customerVisible()->findOrFail($productId);
        $price = $product->price;
        $stock = $product->stock;

        if ($variantId) {
            $variant = ProductVariant::where('product_id', $productId)->where('is_active', true)->findOrFail($variantId);
            $price = $variant->price;
            $stock = $variant->stock;
        }

        if ($stock < $quantity) {
            throw ValidationException::withMessages(['quantity' => ['Insufficient stock.']]);
        }

        $existing = $cart->items()
            ->where('product_id', $productId)
            ->where('product_variant_id', $variantId)
            ->first();

        if ($existing) {
            $newQty = $existing->quantity + $quantity;
            if ($stock < $newQty) {
                throw ValidationException::withMessages(['quantity' => ['Insufficient stock.']]);
            }
            $existing->update(['quantity' => $newQty]);

            return $existing->fresh();
        }

        return $cart->items()->create([
            'product_id' => $productId,
            'product_variant_id' => $variantId,
            'vendor_id' => $product->vendor_id,
            'quantity' => $quantity,
            'price' => $price,
        ]);
    }

    public function updateQuantity(CartItem $item, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            $item->delete();
            throw ValidationException::withMessages(['quantity' => ['Item removed from cart.']]);
        }

        $product = $item->product;
        $stock = $item->variant ? $item->variant->stock : $product->stock;

        if ($stock < $quantity) {
            throw ValidationException::withMessages(['quantity' => ['Insufficient stock.']]);
        }

        $item->update(['quantity' => $quantity]);

        return $item->fresh();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }

    public function mergeGuestCart(User $user, string $sessionId): void
    {
        $guestCart = Cart::where('session_id', $sessionId)->first();
        if (! $guestCart || $guestCart->items->isEmpty()) {
            return;
        }

        $userCart = $this->getOrCreateCart($user);

        foreach ($guestCart->items as $item) {
            $this->addItem($userCart, $item->product_id, $item->quantity, $item->product_variant_id);
        }

        $guestCart->items()->delete();
        $guestCart->delete();
    }
}
