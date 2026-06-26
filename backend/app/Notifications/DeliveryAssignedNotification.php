<?php

namespace App\Notifications;

use App\Models\Delivery;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DeliveryAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Delivery $delivery) {}

    public function via(object $notifiable): array
    {
        return ['database', 'fcm'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'delivery_assigned',
            'delivery_uuid' => $this->delivery->uuid,
            'order_number' => $this->delivery->order->order_number ?? '',
            'message' => 'New delivery assigned: '.($this->delivery->order->order_number ?? ''),
        ];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'title' => 'New delivery',
            'body' => 'Delivery assigned for order '.($this->delivery->order->order_number ?? ''),
            'data' => ['delivery_uuid' => $this->delivery->uuid],
        ];
    }
}
