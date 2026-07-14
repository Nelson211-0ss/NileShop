<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Features\Admin\Services\AdminService;
use App\Features\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Resources\Api\V1\UserResource;
use App\Http\Resources\Api\V1\VendorResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private readonly AdminService $adminService,
        private readonly VendorService $vendorService,
    ) {}

    public function dashboard(): JsonResponse
    {
        return ApiResponse::success($this->adminService->dashboardStats());
    }

    public function reports(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);

        return ApiResponse::success($this->adminService->salesReport($days));
    }

    public function vendors(Request $request): JsonResponse
    {
        $vendors = Vendor::with('user')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return ApiResponse::success(
            VendorResource::collection($vendors),
            meta: ['total' => $vendors->total()]
        );
    }

    public function customers(Request $request): JsonResponse
    {
        $customers = $this->adminService->customerActivity($request->search, $request->integer('per_page', 20));

        return ApiResponse::success(
            collect($customers->items())->map(fn (User $u) => [
                'uuid' => $u->uuid,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'order_count' => $u->orders_count,
                'total_spent' => (float) ($u->orders_sum_total ?? 0),
                'last_order_at' => $u->orders_max_created_at,
                'last_login_at' => $u->last_login_at?->toIso8601String(),
                'created_at' => $u->created_at?->toIso8601String(),
            ]),
            meta: ['total' => $customers->total()]
        );
    }

    public function approveVendor(Request $request, Vendor $vendor): JsonResponse
    {
        $vendor = $this->vendorService->approve($vendor, $request->user());

        return ApiResponse::success(new VendorResource($vendor), 'Vendor approved.');
    }

    public function rejectVendor(Vendor $vendor): JsonResponse
    {
        $vendor = $this->vendorService->reject($vendor);

        return ApiResponse::success(new VendorResource($vendor), 'Vendor rejected.');
    }

    public function users(Request $request): JsonResponse
    {
        $users = User::with('roles')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(20);

        return ApiResponse::success(
            UserResource::collection($users),
            meta: ['total' => $users->total()]
        );
    }

    public function orders(Request $request): JsonResponse
    {
        $orders = Order::with('items')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20);

        return ApiResponse::success(
            OrderResource::collection($orders),
            meta: ['total' => $orders->total()]
        );
    }

    public function products(Request $request): JsonResponse
    {
        $products = Product::with(['vendor', 'category'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20);

        return ApiResponse::success(
            ProductResource::collection($products),
            meta: ['total' => $products->total()]
        );
    }

    public function updateOrderStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'note' => 'nullable|string',
        ]);

        $order = app(\App\Features\Order\Services\OrderService::class)
            ->updateStatus($order, $data['status'], $data['note'] ?? null, $request->user());

        return ApiResponse::success(new OrderResource($order->load('statusHistories')));
    }
}
