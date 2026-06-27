<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Conversation */
class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'vendor' => $this->whenLoaded('vendor', fn () => new VendorResource($this->vendor)),
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'avatar' => $this->customer->avatar,
            ]),
            'product' => $this->whenLoaded('product', fn () => $this->product ? [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
            ] : null),
            'last_message' => $this->whenLoaded('latestMessage', fn () => $this->latestMessage
                ? new ConversationMessageResource($this->latestMessage)
                : null),
            'messages' => ConversationMessageResource::collection($this->whenLoaded('messages')),
            'unread_count' => (int) ($this->unread_count ?? 0),
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'peer_name' => $user && $this->customer_id === $user->id
                ? $this->vendor?->store_name
                : $this->customer?->name,
        ];
    }
}
