<?php

namespace App\Http\Controllers\Api\V1\Shipping;

use App\Features\Shipping\Services\ShippingService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    public function __construct(private readonly ShippingService $shippingService) {}

    public function zones(): JsonResponse
    {
        return ApiResponse::success($this->shippingService->getZones());
    }
}
