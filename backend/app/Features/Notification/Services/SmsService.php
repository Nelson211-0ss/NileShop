<?php

namespace App\Features\Notification\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $phone, string $message): bool
    {
        $driver = config('services.sms.driver', 'log');

        return match ($driver) {
            'africas_talking' => $this->sendViaAfricasTalking($phone, $message),
            default => $this->sendViaLog($phone, $message),
        };
    }

    public function sendOtp(string $phone, string $code): bool
    {
        return $this->send($phone, "Your NileShop verification code is: {$code}. Valid for 10 minutes.");
    }

    private function sendViaLog(string $phone, string $message): bool
    {
        Log::info("SMS to {$phone}: {$message}");

        return true;
    }

    private function sendViaAfricasTalking(string $phone, string $message): bool
    {
        $apiKey = config('services.sms.africas_talking.api_key');
        $username = config('services.sms.africas_talking.username');

        if (! $apiKey || ! $username) {
            return $this->sendViaLog($phone, $message);
        }

        $response = Http::withHeaders([
            'apiKey' => $apiKey,
            'Content-Type' => 'application/x-www-form-urlencoded',
            'Accept' => 'application/json',
        ])->post('https://api.africastalking.com/version1/messaging', [
            'username' => $username,
            'to' => $phone,
            'message' => $message,
        ]);

        return $response->successful();
    }
}
