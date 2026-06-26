<?php

namespace App\Features\Coupon\Services;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CouponService
{
    public function validate(string $code, float $subtotal, ?User $user = null): Coupon
    {
        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (! $coupon || ! $coupon->isValid()) {
            throw ValidationException::withMessages(['coupon' => ['Invalid or expired coupon code.']]);
        }

        if ($coupon->min_order_amount && $subtotal < $coupon->min_order_amount) {
            throw ValidationException::withMessages([
                'coupon' => ['Minimum order amount is '.$coupon->min_order_amount.' for this coupon.'],
            ]);
        }

        return $coupon;
    }

    public function create(array $data): Coupon
    {
        $data['code'] = strtoupper($data['code']);

        return Coupon::create($data);
    }
}
