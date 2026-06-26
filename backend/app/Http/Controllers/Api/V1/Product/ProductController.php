<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Features\Product\Services\ProductService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->list($request->all(), $request->integer('per_page', 20));

        return ApiResponse::success(
            ProductResource::collection($products),
            meta: [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        );
    }

    public function show(string $slug): JsonResponse
    {
        $product = $this->productService->getBySlug($slug);

        return ApiResponse::success(new ProductResource($product));
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2']);
        $products = $this->productService->search($request->input('q'), $request->integer('per_page', 20));

        return ApiResponse::success(
            ProductResource::collection($products),
            meta: [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        );
    }
}
