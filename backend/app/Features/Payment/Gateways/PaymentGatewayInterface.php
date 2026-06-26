<?php

namespace App\Features\Payment\Gateways;

use App\Models\Order;
use App\Models\Payment;

interface PaymentGatewayInterface
{
    public function initiate(Order $order, Payment $payment): array;

    public function verify(string $reference): array;

    public function getName(): string;
}
