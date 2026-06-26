<?php

namespace App\Http\Resources\Api\V1;

use App\Support\StorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ProductImage */
class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'path' => $this->path,
            'url' => StorageUrl::forPath($this->path),
            'alt' => $this->alt,
            'is_primary' => $this->is_primary,
        ];
    }
}
