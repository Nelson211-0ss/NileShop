<?php

namespace App\Features\Payment\Gateways;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class StripeGateway implements PaymentGatewayInterface
{
    public function getName(): string
    {
        return 'stripe';
    }

    public function initiate(Order $order, Payment $payment): array
    {
        $secretKey = config('services.stripe.secret');

        if (! $secretKey) {
            return [
                'status' => 'pending',
                'message' => 'Stripe not configured.',
                'reference' => $payment->uuid,
            ];
        }

        $response = Http::withToken($secretKey)
            ->asForm()
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'success_url' => config('app.url').'/orders/'.$order->uuid.'?paid=1',
                'cancel_url' => config('app.url').'/checkout?cancelled=1',
                'client_reference_id' => $payment->uuid,
                'customer_email' => $order->user->email,
                'line_items[0][price_data][currency]' => strtolower($payment->currency),
                'line_items[0][price_data][product_data][name]' => 'NileShop Order '.$order->order_number,
                'line_items[0][price_data][unit_amount]' => (int) round($payment->amount * 100),
                'line_items[0][quantity]' => 1,
                'metadata[order_uuid]' => $order->uuid,
                'metadata[payment_uuid]' => $payment->uuid,
            ]);

        $data = $response->json();

        return [
            'status' => 'redirect',
            'payment_url' => $data['url'] ?? null,
            'reference' => $payment->uuid,
            'session_id' => $data['id'] ?? null,
        ];
    }

    public function verify(string $reference): array
    {
        $secretKey = config('services.stripe.secret');

        if (! $secretKey) {
            return ['success' => false, 'reference' => $reference];
        }

        $response = Http::withToken($secretKey)
            ->get('https://api.stripe.com/v1/checkout/sessions', [
                'client_reference_id' => $reference,
                'limit' => 1,
            ]);

        $session = $response->json('data.0');

        return [
            'success' => ($session['payment_status'] ?? '') === 'paid',
            'reference' => $reference,
            'raw' => $session,
        ];
    }
}
