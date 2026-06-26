<?php

namespace App\Features\Payment\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Features\Payment\Gateways\FlutterwaveGateway;
use App\Features\Wallet\Services\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(private readonly WalletService $walletService) {}

    public function process(Order $order, string $gateway, User $user): Payment
    {
        if ($order->payment_status === 'paid') {
            throw ValidationException::withMessages(['order' => ['Order already paid.']]);
        }

        return match ($gateway) {
            'cash_on_delivery' => $this->processCod($order, $user),
            'bank_transfer' => $this->processBankTransfer($order, $user),
            'mobile_money' => $this->processMobileMoney($order, $user),
            'wallet' => $this->processWallet($order, $user),
            'card' => $this->processCard($order, $user),
            default => throw ValidationException::withMessages(['gateway' => ['Invalid payment method.']]),
        };
    }

    private function processCod(Order $order, User $user): Payment
    {
        return $this->createPayment($order, $user, 'cash_on_delivery', 'pending', [
            'note' => 'Payment due on delivery',
        ]);
    }

    private function processBankTransfer(Order $order, User $user): Payment
    {
        return $this->createPayment($order, $user, 'bank_transfer', 'pending', [
            'instructions' => 'Transfer to NileShop Bank Account. Reference: '.$order->order_number,
        ]);
    }

    private function processMobileMoney(Order $order, User $user): Payment
    {
        return $this->createPayment($order, $user, 'mobile_money', 'pending', [
            'instructions' => 'Complete payment via mobile money. Reference: '.$order->order_number,
        ]);
    }

    private function processWallet(Order $order, User $user): Payment
    {
        return DB::transaction(function () use ($order, $user) {
            $this->walletService->deduct($user, $order->total, 'Payment for order '.$order->order_number, $order->order_number);

            $payment = $this->createPayment($order, $user, 'wallet', 'completed');
            $this->markOrderPaid($order);

            return $payment;
        });
    }

    private function processCard(Order $order, User $user): Payment
    {
        $payment = $this->createPayment($order, $user, 'card', 'pending');

        if (config('services.stripe.secret')) {
            $gateway = new \App\Features\Payment\Gateways\StripeGateway();
            $result = $gateway->initiate($order, $payment);
            $payment->update(['metadata' => $result, 'gateway' => 'stripe']);

            return $payment->fresh();
        }

        if (config('services.flutterwave.secret_key')) {
            $gateway = new FlutterwaveGateway();
            $result = $gateway->initiate($order, $payment);
            $payment->update(['metadata' => $result, 'gateway' => 'flutterwave']);

            return $payment->fresh();
        }

        $payment->update(['metadata' => [
            'redirect_url' => config('app.url').'/payment/card/'.$order->uuid,
        ]]);

        return $payment->fresh();
    }

    public function confirmPayment(Payment $payment): Payment
    {
        $payment->update(['status' => 'completed', 'paid_at' => now()]);
        $this->markOrderPaid($payment->order);

        return $payment->fresh();
    }

    private function createPayment(Order $order, User $user, string $gateway, string $status, array $metadata = []): Payment
    {
        return Payment::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'gateway' => $gateway,
            'status' => $status,
            'amount' => $order->total,
            'currency' => $order->currency,
            'reference' => $order->order_number,
            'metadata' => $metadata,
            'paid_at' => $status === 'completed' ? now() : null,
        ]);
    }

    private function markOrderPaid(Order $order): void
    {
        $order->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
            'status' => 'confirmed',
        ]);
    }
}
