<?php

namespace App\Http\Controllers\Api\V1\Wishlist;

use App\Features\Wishlist\Services\WishlistService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function __construct(private readonly WishlistService $wishlistService) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->wishlistService->list($request->user());

        return ApiResponse::success(
            $items->map(fn ($w) => new ProductResource($w->product))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['product_id' => 'required|exists:products,id']);
        $product = Product::findOrFail($data['product_id']);
        $this->wishlistService->add($request->user(), $product);

        return ApiResponse::success(null, 'Added to wishlist.', 201);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->wishlistService->remove($request->user(), $product);

        return ApiResponse::success(null, 'Removed from wishlist.');
    }
}
