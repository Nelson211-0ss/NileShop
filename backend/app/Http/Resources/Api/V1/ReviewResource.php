<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Review */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'images' => $this->images,
            'user' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'avatar' => $this->user->avatar,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
