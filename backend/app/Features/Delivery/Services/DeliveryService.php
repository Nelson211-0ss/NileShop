<?php

namespace App\Features\Delivery\Services;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\RiderLocation;
use App\Models\User;
use App\Notifications\DeliveryAssignedNotification;
use Illuminate\Validation\ValidationException;

class DeliveryService
{
    public function createForOrder(Order $order): Delivery
    {
        return Delivery::firstOrCreate(
            ['order_id' => $order->id],
            ['status' => 'pending', 'earnings' => 500]
        );
    }

    public function assign(Delivery $delivery, User $rider): Delivery
    {
        if (! $rider->isDeliveryRider()) {
            throw ValidationException::withMessages(['rider' => ['User is not a delivery rider.']]);
        }

        $delivery->update([
            'rider_id' => $rider->id,
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);

        $rider->notify(new DeliveryAssignedNotification($delivery));

        return $delivery->fresh(['order', 'rider']);
    }

    public function pickup(Delivery $delivery, User $rider): Delivery
    {
        $this->authorizeRider($delivery, $rider);

        $delivery->update([
            'status' => 'picked_up',
            'picked_up_at' => now(),
        ]);

        return $delivery->fresh();
    }

    public function complete(
        Delivery $delivery,
        User $rider,
        ?string $proofPhoto = null,
        ?string $signature = null,
        ?string $note = null,
    ): Delivery {
        $this->authorizeRider($delivery, $rider);

        $delivery->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'proof_photo' => $proofPhoto,
            'signature' => $signature,
            'delivery_note' => $note,
        ]);

        $delivery->order->update(['status' => 'delivered', 'delivered_at' => now()]);

        return $delivery->fresh(['order']);
    }

    public function updateLocation(User $rider, float $lat, float $lng, ?float $heading = null, bool $available = true): RiderLocation
    {
        return RiderLocation::create([
            'rider_id' => $rider->id,
            'latitude' => $lat,
            'longitude' => $lng,
            'heading' => $heading,
            'is_available' => $available,
        ]);
    }

    public function riderDeliveries(User $rider, ?string $status = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Delivery::where('rider_id', $rider->id)->with(['order.items']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('created_at')->get();
    }

    public function availableRiders(): \Illuminate\Database\Eloquent\Collection
    {
        return User::role('delivery_rider')
            ->where('is_active', true)
            ->with(['riderLocations' => fn ($q) => $q->latest()->limit(1)])
            ->get();
    }

    private function authorizeRider(Delivery $delivery, User $rider): void
    {
        if ($delivery->rider_id !== $rider->id) {
            throw ValidationException::withMessages(['delivery' => ['Not assigned to this delivery.']]);
        }
    }
}
