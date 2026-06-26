<?php

namespace App\Http\Controllers\Api\V1\Delivery;

use App\Features\Delivery\Services\DeliveryService;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDeliveryController extends Controller
{
    public function __construct(private readonly DeliveryService $deliveryService) {}

    public function index(Request $request): JsonResponse
    {
        $deliveries = Delivery::with(['order', 'rider'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20);

        return ApiResponse::success($deliveries->items(), meta: ['total' => $deliveries->total()]);
    }

    public function assign(Request $request, Delivery $delivery): JsonResponse
    {
        $data = $request->validate(['rider_id' => 'required|exists:users,id']);
        $rider = User::findOrFail($data['rider_id']);

        $delivery = $this->deliveryService->assign($delivery, $rider);

        return ApiResponse::success([
            'uuid' => $delivery->uuid,
            'status' => $delivery->status,
            'rider' => $delivery->rider?->only(['id', 'name', 'phone']),
        ], 'Rider assigned.');
    }

    public function riders(): JsonResponse
    {
        $riders = $this->deliveryService->availableRiders();

        return ApiResponse::success($riders->map(fn (User $r) => [
            'id' => $r->id,
            'name' => $r->name,
            'phone' => $r->phone,
            'last_location' => $r->riderLocations->first(),
        ]));
    }

    public function track(Delivery $delivery): JsonResponse
    {
        $delivery->load(['order', 'rider']);

        $lastLocation = $delivery->rider
            ? \App\Models\RiderLocation::where('rider_id', $delivery->rider_id)->latest()->first()
            : null;

        return ApiResponse::success([
            'delivery' => [
                'uuid' => $delivery->uuid,
                'status' => $delivery->status,
                'rider' => $delivery->rider?->only(['name', 'phone']),
            ],
            'rider_location' => $lastLocation ? [
                'latitude' => $lastLocation->latitude,
                'longitude' => $lastLocation->longitude,
                'updated_at' => $lastLocation->created_at->toIso8601String(),
            ] : null,
        ]);
    }
}
