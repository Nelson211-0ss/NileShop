<?php

namespace App\Features\Shipping\Services;

use App\Models\Cart;
use App\Models\ShippingRate;
use App\Models\ShippingZone;

class ShippingService
{
    public function calculate(Cart $cart, array $shippingAddress, ?int $zoneId = null, float $subtotal = 0): float
    {
        $zone = $zoneId
            ? ShippingZone::find($zoneId)
            : ShippingZone::where('is_active', true)->first();

        if (! $zone) {
            return 500.00;
        }

        $rate = $zone->rates()->where('is_active', true)->first();

        if (! $rate) {
            return 500.00;
        }

        if ($rate->min_order_free_shipping && $subtotal >= $rate->min_order_free_shipping) {
            return 0;
        }

        $totalWeight = $cart->items->sum(function ($item) {
            return ($item->product->weight ?? 0.5) * $item->quantity;
        });

        return $rate->base_rate + ($totalWeight * $rate->per_kg_rate);
    }

    public function getZones(): \Illuminate\Database\Eloquent\Collection
    {
        return ShippingZone::where('is_active', true)->with('rates')->get();
    }
}
