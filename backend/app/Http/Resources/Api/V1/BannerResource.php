<?php

namespace App\Http\Resources\Api\V1;

use App\Support\StorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Banner */
class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image' => StorageUrl::forPath($this->image),
            'link' => $this->link,
            'position' => $this->position,
        ];
    }
}
