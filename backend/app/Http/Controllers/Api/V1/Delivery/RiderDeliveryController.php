<?php

namespace App\Http\Controllers\Api\V1\Delivery;

use App\Features\Delivery\Services\DeliveryService;
use App\Features\Upload\Services\UploadService;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiderDeliveryController extends Controller
{
    public function __construct(
        private readonly DeliveryService $deliveryService,
        private readonly UploadService $uploadService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $deliveries = $this->deliveryService->riderDeliveries(
            $request->user(),
            $request->input('status'),
        );

        return ApiResponse::success($deliveries->map(fn (Delivery $d) => $this->formatDelivery($d)));
    }

    public function updateLocation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'heading' => 'nullable|numeric',
            'is_available' => 'boolean',
        ]);

        $location = $this->deliveryService->updateLocation(
            $request->user(),
            $data['latitude'],
            $data['longitude'],
            $data['heading'] ?? null,
            $data['is_available'] ?? true,
        );

        return ApiResponse::success([
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'is_available' => $location->is_available,
        ]);
    }

    public function pickup(Request $request, Delivery $delivery): JsonResponse
    {
        $delivery = $this->deliveryService->pickup($delivery, $request->user());

        return ApiResponse::success($this->formatDelivery($delivery), 'Order picked up.');
    }

    public function complete(Request $request, Delivery $delivery): JsonResponse
    {
        $data = $request->validate([
            'proof_photo' => 'nullable|string',
            'signature' => 'nullable|string',
            'delivery_note' => 'nullable|string|max:500',
            'file' => 'nullable|image|max:5120',
        ]);

        $proofPhoto = $data['proof_photo'] ?? null;
        if ($request->hasFile('file')) {
            $upload = $this->uploadService->uploadImage($request->file('file'), 'deliveries');
            $proofPhoto = $upload['path'];
        }

        $delivery = $this->deliveryService->complete(
            $delivery,
            $request->user(),
            $proofPhoto,
            $data['signature'] ?? null,
            $data['delivery_note'] ?? null,
        );

        return ApiResponse::success($this->formatDelivery($delivery), 'Delivery completed.');
    }

    public function earnings(Request $request): JsonResponse
    {
        $total = Delivery::where('rider_id', $request->user()->id)
            ->where('status', 'delivered')
            ->sum('earnings');

        $today = Delivery::where('rider_id', $request->user()->id)
            ->where('status', 'delivered')
            ->whereDate('delivered_at', today())
            ->sum('earnings');

        return ApiResponse::success([
            'total_earnings' => $total,
            'today_earnings' => $today,
            'completed_deliveries' => Delivery::where('rider_id', $request->user()->id)->where('status', 'delivered')->count(),
        ]);
    }

    private function formatDelivery(Delivery $delivery): array
    {
        return [
            'uuid' => $delivery->uuid,
            'status' => $delivery->status,
            'earnings' => $delivery->earnings,
            'order' => $delivery->relationLoaded('order') ? [
                'uuid' => $delivery->order->uuid,
                'order_number' => $delivery->order->order_number,
                'total' => $delivery->order->total,
                'shipping_address' => $delivery->order->shipping_address,
            ] : null,
            'assigned_at' => $delivery->assigned_at?->toIso8601String(),
            'picked_up_at' => $delivery->picked_up_at?->toIso8601String(),
            'delivered_at' => $delivery->delivered_at?->toIso8601String(),
        ];
    }
}
