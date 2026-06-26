<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Vendor */
class VendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'slug' => $this->slug,
            'logo' => $this->logo,
            'banner' => $this->banner,
            'description' => $this->description,
            'status' => $this->status,
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
            'is_featured' => $this->is_featured,
            'city' => $this->city,
            'country' => $this->country,
        ];
    }
}
