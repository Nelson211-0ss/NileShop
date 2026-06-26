<?php

namespace App\Http\Controllers\Api\V1\Cart;

use App\Features\Cart\Services\CartService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CartResource;
use App\Models\CartItem;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $cart->load(['items.product.images', 'items.vendor']);

        return ApiResponse::success(new CartResource($cart));
    }

    public function addItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1|max:99',
            'product_variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $cart = $this->resolveCart($request);
        $this->cartService->addItem(
            $cart,
            $data['product_id'],
            $data['quantity'] ?? 1,
            $data['product_variant_id'] ?? null,
        );

        $cart->load(['items.product.images', 'items.vendor']);

        return ApiResponse::success(new CartResource($cart), 'Item added to cart.');
    }

    public function updateItem(Request $request, CartItem $item): JsonResponse
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1|max:99']);
        $cart = $this->resolveCart($request);
        abort_unless($item->cart_id === $cart->id, 403);

        $this->cartService->updateQuantity($item, $data['quantity']);
        $cart->load(['items.product.images', 'items.vendor']);

        return ApiResponse::success(new CartResource($cart));
    }

    public function removeItem(Request $request, CartItem $item): JsonResponse
    {
        $cart = $this->resolveCart($request);
        abort_unless($item->cart_id === $cart->id, 403);

        $this->cartService->removeItem($item);
        $cart->load(['items.product.images', 'items.vendor']);

        return ApiResponse::success(new CartResource($cart), 'Item removed.');
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $this->cartService->clear($cart);

        return ApiResponse::success(null, 'Cart cleared.');
    }

    private function resolveCart(Request $request): \App\Models\Cart
    {
        if ($request->user()) {
            return $this->cartService->getOrCreateCart($request->user());
        }

        $sessionId = $request->header('X-Cart-Session') ?? $request->session()->getId();

        return $this->cartService->getOrCreateCart(null, $sessionId);
    }
}
