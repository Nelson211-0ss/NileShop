<?php

namespace App\Features\Payment\Gateways;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class FlutterwaveGateway implements PaymentGatewayInterface
{
    public function getName(): string
    {
        return 'flutterwave';
    }

    public function initiate(Order $order, Payment $payment): array
    {
        $secretKey = config('services.flutterwave.secret_key');

        if (! $secretKey) {
            return [
                'status' => 'pending',
                'message' => 'Flutterwave not configured. Use manual payment.',
                'reference' => $payment->reference,
            ];
        }

        $response = Http::withToken($secretKey)->post('https://api.flutterwave.com/v3/payments', [
            'tx_ref' => $payment->uuid,
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'redirect_url' => config('app.url').'/payment/callback/flutterwave',
            'customer' => [
                'email' => $order->user->email,
                'name' => $order->user->name,
            ],
            'customizations' => [
                'title' => 'NileShop Order',
                'description' => $order->order_number,
            ],
        ]);

        $data = $response->json();

        return [
            'status' => 'redirect',
            'payment_url' => $data['data']['link'] ?? null,
            'reference' => $payment->uuid,
        ];
    }

    public function verify(string $reference): array
    {
        $secretKey = config('services.flutterwave.secret_key');

        $response = Http::withToken($secretKey)
            ->get("https://api.flutterwave.com/v3/transactions/{$reference}/verify");

        $data = $response->json();

        return [
            'success' => ($data['data']['status'] ?? '') === 'successful',
            'reference' => $reference,
            'amount' => $data['data']['amount'] ?? 0,
            'raw' => $data,
        ];
    }
}
