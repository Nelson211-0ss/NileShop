<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Cart */
class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $subtotal = $this->items->sum(fn ($item) => $item->price * $item->quantity);

        return [
            'id' => $this->id,
            'currency' => $this->currency,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'item_count' => $this->items->sum('quantity'),
            'subtotal' => $subtotal,
        ];
    }
}
