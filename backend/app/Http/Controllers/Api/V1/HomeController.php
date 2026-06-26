<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BannerResource;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Banner;
use App\Models\FlashSale;
use App\Features\Product\Services\ProductService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    public function index(): JsonResponse
    {
        $banners = Banner::where('is_active', true)
            ->where('position', 'home')
            ->orderBy('sort_order')
            ->get();

        $flashSale = FlashSale::where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->with(['products.product.images', 'products.product.vendor'])
            ->first();

        return ApiResponse::success([
            'banners' => BannerResource::collection($banners),
            'featured_products' => ProductResource::collection($this->productService->featured()),
            'best_sellers' => ProductResource::collection($this->productService->bestSellers()),
            'flash_sale' => $flashSale ? [
                'name' => $flashSale->name,
                'ends_at' => $flashSale->ends_at->toIso8601String(),
                'products' => ProductResource::collection(
                    $flashSale->products->map(fn ($fp) => $fp->product)->filter()
                ),
            ] : null,
        ]);
    }
}
