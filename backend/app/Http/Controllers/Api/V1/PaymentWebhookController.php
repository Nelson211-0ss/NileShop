<?php

namespace App\Http\Controllers\Api\V1;

use App\Features\Payment\Gateways\FlutterwaveGateway;
use App\Features\Payment\Gateways\StripeGateway;
use App\Features\Payment\Services\PaymentService;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentGatewayLog;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function flutterwave(Request $request): JsonResponse
    {
        PaymentGatewayLog::create([
            'gateway' => 'flutterwave',
            'event' => 'webhook',
            'payload' => $request->all(),
            'status' => 'received',
        ]);

        $reference = $request->input('data.id') ?? $request->input('tx_ref');

        if ($reference) {
            $gateway = new FlutterwaveGateway();
            $result = $gateway->verify((string) $reference);

            if ($result['success']) {
                $payment = Payment::where('uuid', $request->input('tx_ref'))->first();
                if ($payment) {
                    app(PaymentService::class)->confirmPayment($payment);
                }
            }
        }

        return ApiResponse::success(null, 'Webhook processed.');
    }

    public function stripe(Request $request): JsonResponse
    {
        PaymentGatewayLog::create([
            'gateway' => 'stripe',
            'event' => $request->input('type', 'webhook'),
            'payload' => $request->all(),
            'status' => 'received',
        ]);

        $type = $request->input('type');
        $object = $request->input('data.object', []);

        if ($type === 'checkout.session.completed') {
            $paymentUuid = $object['client_reference_id'] ?? $object['metadata']['payment_uuid'] ?? null;

            if ($paymentUuid) {
                $payment = Payment::where('uuid', $paymentUuid)->first();
                if ($payment && ($object['payment_status'] ?? '') === 'paid') {
                    app(PaymentService::class)->confirmPayment($payment);
                }
            }
        }

        return ApiResponse::success(null, 'Webhook received.');
    }
}
