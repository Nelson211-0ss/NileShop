<?php

namespace App\Http\Controllers\Api\V1\Order;

use App\Features\Cart\Services\CartService;
use App\Features\Order\Services\OrderService;
use App\Features\Payment\Services\PaymentService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly CartService $cartService,
        private readonly PaymentService $paymentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->getUserOrders($request->user(), $request->integer('per_page', 15));

        return ApiResponse::success(
            OrderResource::collection($orders),
            meta: ['current_page' => $orders->currentPage(), 'total' => $orders->total()]
        );
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)
            ->where('user_id', $request->user()->id)
            ->with(['items.vendor', 'statusHistories'])
            ->firstOrFail();

        return ApiResponse::success(new OrderResource($order));
    }

    public function checkout(Request $request): JsonResponse
    {
        $data = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.full_name' => 'required|string',
            'shipping_address.phone' => 'required|string',
            'shipping_address.address_line_1' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.country' => 'required|string',
            'billing_address' => 'nullable|array',
            'coupon_code' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
            'shipping_zone_id' => 'nullable|exists:shipping_zones,id',
            'payment_gateway' => 'required|in:cash_on_delivery,bank_transfer,mobile_money,wallet,card',
        ]);

        $cart = $this->cartService->getOrCreateCart($request->user());
        $cart->load('items.product');

        $order = $this->orderService->createFromCart(
            $request->user(),
            $cart,
            $data['shipping_address'],
            $data['billing_address'] ?? null,
            $data['coupon_code'] ?? null,
            $data['notes'] ?? null,
            $data['shipping_zone_id'] ?? null,
        );

        $payment = $this->paymentService->process($order, $data['payment_gateway'], $request->user());

        return ApiResponse::success([
            'order' => new OrderResource($order),
            'payment' => [
                'uuid' => $payment->uuid,
                'gateway' => $payment->gateway,
                'status' => $payment->status,
                'metadata' => $payment->metadata,
            ],
        ], 'Order placed successfully.', 201);
    }

    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)->where('user_id', $request->user()->id)->firstOrFail();
        $order = $this->orderService->cancel($order, $request->user());

        return ApiResponse::success(new OrderResource($order->load('statusHistories')), 'Order cancelled.');
    }

    public function track(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)
            ->with(['statusHistories', 'items'])
            ->firstOrFail();

        return ApiResponse::success(new OrderResource($order));
    }
}
