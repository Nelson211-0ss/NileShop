<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Features\Catalog\Services\CatalogService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BrandResource;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function __construct(private readonly CatalogService $catalogService) {}

    public function categories(): JsonResponse
    {
        return ApiResponse::success(
            CategoryResource::collection($this->catalogService->getCategories())
        );
    }

    public function category(string $slug): JsonResponse
    {
        $category = $this->catalogService->getCategoryBySlug($slug);

        return ApiResponse::success(new CategoryResource($category));
    }

    public function brands(Request $request): JsonResponse
    {
        $brands = $this->catalogService->getBrands($request->integer('per_page', 20));

        return ApiResponse::success(
            BrandResource::collection($brands),
            meta: [
                'current_page' => $brands->currentPage(),
                'per_page' => $brands->perPage(),
                'total' => $brands->total(),
            ]
        );
    }
}
