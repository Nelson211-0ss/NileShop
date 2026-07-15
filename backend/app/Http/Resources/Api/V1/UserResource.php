<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'locale' => $this->locale,
            'currency' => $this->currency,
            'timezone' => $this->timezone,
            'email_verified' => $this->hasVerifiedEmail(),
            'phone_verified' => $this->phone_verified_at !== null,
            'two_factor_enabled' => $this->two_factor_enabled,
            'is_active' => $this->is_active,
            'roles' => $this->whenLoaded('roles', fn () => $this->getRoleNames()),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
