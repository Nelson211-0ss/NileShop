<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Features\Product\Services\ProductService;
use App\Features\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
        private readonly VendorService $vendorService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor, 404, 'Vendor store not found');

        $products = Product::where('vendor_id', $vendor->id)
            ->with(['images', 'category'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return ApiResponse::success(
            ProductResource::collection($products),
            meta: ['current_page' => $products->currentPage(), 'total' => $products->total()]
        );
    }

    public function store(Request $request): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor, 404, 'Vendor store not found');

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'sku' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:draft,published',
            'is_featured' => 'sometimes|boolean',
            'tags' => 'nullable|array',
            'warranty' => 'nullable|string',
            'image_paths' => 'nullable|array|max:10',
            'image_paths.*' => 'string|max:500',
        ]);

        $imagePaths = $data['image_paths'] ?? [];
        unset($data['image_paths']);

        $product = $this->productService->create($vendor, $data);
        $this->productService->syncImages($product, $imagePaths);

        return ApiResponse::success(
            new ProductResource($product->fresh(['images', 'category'])),
            'Product created.',
            201,
        );
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor && $product->vendor_id === $vendor->id, 403);

        $product->load(['images', 'category', 'brand']);

        return ApiResponse::success(new ProductResource($product));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor && $product->vendor_id === $vendor->id, 403);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,published,archived',
            'is_featured' => 'sometimes|boolean',
            'image_paths' => 'nullable|array|max:10',
            'image_paths.*' => 'string|max:500',
        ]);

        $imagePaths = $data['image_paths'] ?? null;
        unset($data['image_paths']);

        $product = $this->productService->update($product, $data);

        if (is_array($imagePaths)) {
            $this->productService->syncImages($product, $imagePaths);
        }

        return ApiResponse::success(new ProductResource($product->fresh(['images', 'category'])), 'Product updated.');
    }

    public function addImages(Request $request, Product $product): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor && $product->vendor_id === $vendor->id, 403);

        $data = $request->validate([
            'paths' => 'required|array|max:10',
            'paths.*' => 'string|max:500',
        ]);

        foreach ($data['paths'] as $index => $path) {
            $this->productService->addImage($product, $path, $index === 0 && ! $product->images()->exists());
        }

        return ApiResponse::success(
            new ProductResource($product->fresh(['images', 'category'])),
            'Images added.',
            201,
        );
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor && $product->vendor_id === $vendor->id, 403);

        $this->productService->delete($product);

        return ApiResponse::success(null, 'Product deleted.');
    }
}
