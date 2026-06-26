<?php

namespace App\Features\Notification\Services;

use App\Models\DeviceToken;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = DeviceToken::where('user_id', $user->id)->pluck('token');

        foreach ($tokens as $token) {
            $this->send($token, $title, $body, $data);
        }
    }

    public function send(string $token, string $title, string $body, array $data = []): void
    {
        $serverKey = config('services.fcm.server_key');

        if (! $serverKey) {
            Log::info('FCM push (log driver)', compact('token', 'title', 'body', 'data'));

            return;
        }

        Http::withToken($serverKey)->post('https://fcm.googleapis.com/fcm/send', [
            'to' => $token,
            'notification' => [
                'title' => $title,
                'body' => $body,
            ],
            'data' => $data,
        ]);
    }
}
