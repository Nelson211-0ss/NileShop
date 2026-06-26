<?php

namespace App\Http\Controllers\Api\V1\Coupon;

use App\Features\Coupon\Services\CouponService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CouponController extends Controller
{
    public function __construct(private readonly CouponService $couponService) {}

    public function validate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = $this->couponService->validate(
            $data['code'],
            $data['subtotal'],
            $request->user(),
        );

        return ApiResponse::success([
            'code' => $coupon->code,
            'name' => $coupon->name,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount' => $coupon->calculateDiscount($data['subtotal']),
        ]);
    }
}
