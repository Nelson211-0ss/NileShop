<?php

namespace App\Features\Conversation\Services;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class ConversationService
{
    public function findOrCreate(User $customer, int $vendorId, ?int $productId = null): Conversation
    {
        $vendor = Vendor::query()->whereKey($vendorId)->where('status', 'approved')->first();

        if (! $vendor) {
            throw ValidationException::withMessages(['vendor_id' => ['Vendor not found.']]);
        }

        if ($vendor->user_id === $customer->id) {
            throw ValidationException::withMessages(['vendor_id' => ['You cannot message your own store.']]);
        }

        $conversation = Conversation::query()->firstOrCreate(
            [
                'customer_id' => $customer->id,
                'vendor_id' => $vendor->id,
            ],
            ['product_id' => $productId],
        );

        if ($productId && ! $conversation->product_id) {
            $conversation->update(['product_id' => $productId]);
        }

        return $conversation->fresh(['vendor', 'customer', 'product', 'latestMessage']);
    }

    /** @return Collection<int, Conversation> */
    public function listForUser(User $user, string $perspective = 'customer'): Collection
    {
        $vendor = Vendor::query()->where('user_id', $user->id)->first();

        $query = Conversation::query()
            ->with(['vendor', 'customer', 'product', 'latestMessage'])
            ->withCount([
                'messages as unread_count' => fn ($q) => $q
                    ->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at'),
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at');

        if ($perspective === 'vendor') {
            abort_unless($vendor, 403, 'Vendor store not found.');
            $query->where('vendor_id', $vendor->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        return $query->get();
    }

    public function getForUser(User $user, Conversation $conversation): Conversation
    {
        $this->authorizeParticipant($conversation, $user);

        $conversation->load(['vendor', 'customer', 'product', 'messages.sender']);

        $this->markAsRead($conversation, $user);

        return $conversation->fresh(['vendor', 'customer', 'product', 'messages.sender']);
    }

    public function sendMessage(Conversation $conversation, User $sender, string $body): ConversationMessage
    {
        $this->authorizeParticipant($conversation, $sender);

        $message = $conversation->messages()->create([
            'sender_id' => $sender->id,
            'body' => trim($body),
        ]);

        $conversation->update(['last_message_at' => $message->created_at]);

        return $message->load('sender');
    }

    public function markAsRead(Conversation $conversation, User $reader): void
    {
        $this->authorizeParticipant($conversation, $reader);

        $conversation->messages()
            ->where('sender_id', '!=', $reader->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function unreadCount(User $user, string $perspective = 'customer'): int
    {
        $vendor = Vendor::query()->where('user_id', $user->id)->first();

        $conversationQuery = Conversation::query();

        if ($perspective === 'vendor') {
            if (! $vendor) {
                return 0;
            }
            $conversationQuery->where('vendor_id', $vendor->id);
        } else {
            $conversationQuery->where('customer_id', $user->id);
        }

        $conversationIds = $conversationQuery->pluck('id');

        return ConversationMessage::query()
            ->whereIn('conversation_id', $conversationIds)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    public function authorizeParticipant(Conversation $conversation, User $user): void
    {
        if ($conversation->customer_id === $user->id) {
            return;
        }

        $vendor = Vendor::query()->where('user_id', $user->id)->first();

        if ($vendor && $conversation->vendor_id === $vendor->id) {
            return;
        }

        abort(403, 'You do not have access to this conversation.');
    }
}
