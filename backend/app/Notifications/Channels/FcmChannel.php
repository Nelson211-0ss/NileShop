<?php

namespace App\Notifications\Channels;

use App\Features\Notification\Services\PushNotificationService;
use Illuminate\Notifications\Notification;

class FcmChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toFcm')) {
            return;
        }

        $message = $notification->toFcm($notifiable);
        app(PushNotificationService::class)->sendToUser(
            $notifiable,
            $message['title'],
            $message['body'],
            $message['data'] ?? [],
        );
    }
}
