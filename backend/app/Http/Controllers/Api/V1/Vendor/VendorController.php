<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Features\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Resources\Api\V1\VendorResource;
use App\Models\OrderItem;
use App\Models\Vendor;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function __construct(private readonly VendorService $vendorService) {}

    public function show(string $slug): JsonResponse
    {
        $vendor = $this->vendorService->getBySlug($slug);
        $vendor->loadCount('products');

        return ApiResponse::success(new VendorResource($vendor));
    }

    public function myStore(Request $request): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor, 404, 'Vendor store not found');

        return ApiResponse::success(new VendorResource($vendor));
    }

    public function updateStore(Request $request): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor, 404, 'Vendor store not found');

        $data = $request->validate([
            'store_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'policies' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'store_hours' => 'nullable|array',
        ]);

        $vendor = $this->vendorService->updateStore($vendor, $data);

        return ApiResponse::success(new VendorResource($vendor), 'Store updated.');
    }

    public function orders(Request $request): JsonResponse
    {
        $vendor = $this->vendorService->getByUser($request->user());
        abort_unless($vendor, 404);

        $orderIds = OrderItem::where('vendor_id', $vendor->id)
            ->pluck('order_id')->unique();

        $orders = \App\Models\Order::whereIn('id', $orderIds)
            ->with(['items' => fn ($q) => $q->where('vendor_id', $vendor->id)])
            ->orderByDesc('created_at')
            ->paginate(15);

        return ApiResponse::success(
            OrderResource::collection($orders),
            meta: ['current_page' => $orders->currentPage(), 'total' => $orders->total()]
        );
    }

    public function products(string $slug, Request $request): JsonResponse
    {
        $vendor = $this->vendorService->getBySlug($slug);
        $products = $vendor->products()
            ->where('status', 'published')
            ->with(['images', 'category'])
            ->paginate($request->integer('per_page', 20));

        return ApiResponse::success(
            ProductResource::collection($products),
            meta: ['current_page' => $products->currentPage(), 'total' => $products->total()]
        );
    }
}
