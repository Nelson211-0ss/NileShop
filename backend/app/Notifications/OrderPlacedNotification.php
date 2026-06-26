<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail', 'fcm'];
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Order Confirmed — '.$this->order->order_number)
            ->line('Your order has been placed successfully.')
            ->line('Total: '.$this->order->total.' '.$this->order->currency)
            ->action('View Order', config('app.url').'/orders/'.$this->order->uuid);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_placed',
            'order_uuid' => $this->order->uuid,
            'order_number' => $this->order->order_number,
            'total' => $this->order->total,
            'message' => 'Order '.$this->order->order_number.' confirmed.',
        ];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'title' => 'Order confirmed',
            'body' => 'Order '.$this->order->order_number.' has been placed.',
            'data' => ['order_uuid' => $this->order->uuid],
        ];
    }
}
