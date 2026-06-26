<?php

namespace App\Features\Order\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Features\Coupon\Services\CouponService;
use App\Features\Delivery\Services\DeliveryService;
use App\Features\Shipping\Services\ShippingService;
use App\Notifications\OrderPlacedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly CouponService $couponService,
        private readonly ShippingService $shippingService,
        private readonly DeliveryService $deliveryService,
    ) {}

    public function createFromCart(
        User $user,
        Cart $cart,
        array $shippingAddress,
        ?array $billingAddress = null,
        ?string $couponCode = null,
        ?string $notes = null,
        ?int $shippingZoneId = null,
    ): Order {
        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => ['Your cart is empty.']]);
        }

        return DB::transaction(function () use ($user, $cart, $shippingAddress, $billingAddress, $couponCode, $notes, $shippingZoneId) {
            $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);
            $discount = 0;
            $coupon = null;

            if ($couponCode) {
                $coupon = $this->couponService->validate($couponCode, $subtotal, $user);
                $discount = $coupon->calculateDiscount($subtotal);
            }

            $shippingCost = $this->shippingService->calculate($cart, $shippingAddress, $shippingZoneId, $subtotal);
            $tax = round($subtotal * 0.05, 2);
            $total = $subtotal - $discount + $shippingCost + $tax;

            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'payment_status' => 'pending',
                'currency' => $cart->currency,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => $shippingCost,
                'tax' => $tax,
                'total' => $total,
                'coupon_id' => $coupon?->id,
                'coupon_code' => $coupon?->code,
                'shipping_address' => $shippingAddress,
                'billing_address' => $billingAddress ?? $shippingAddress,
                'notes' => $notes,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'vendor_id' => $item->vendor_id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'sku' => $item->variant?->sku ?? $item->product->sku,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->price * $item->quantity,
                ]);

                $item->product->decrement('stock', $item->quantity);
                $item->product->increment('total_sales', $item->quantity);
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            $this->recordStatus($order, 'pending', 'Order placed');

            $this->deliveryService->createForOrder($order);
            $user->notify(new OrderPlacedNotification($order));

            $cart->items()->delete();

            return $order->load(['items', 'statusHistories']);
        });
    }

    public function updateStatus(Order $order, string $status, ?string $note = null, ?User $changedBy = null): Order
    {
        $order->update(['status' => $status]);

        if ($status === 'shipped') {
            $order->update(['shipped_at' => now()]);
        }
        if ($status === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }
        if ($status === 'cancelled') {
            $order->update(['cancelled_at' => now()]);
        }

        $this->recordStatus($order, $status, $note, $changedBy);

        return $order->fresh(['items', 'statusHistories']);
    }

    public function cancel(Order $order, User $user): Order
    {
        if (! in_array($order->status, ['pending', 'confirmed'], true)) {
            throw ValidationException::withMessages(['order' => ['This order cannot be cancelled.']]);
        }

        if ($order->user_id !== $user->id) {
            throw ValidationException::withMessages(['order' => ['Unauthorized.']]);
        }

        return $this->updateStatus($order, 'cancelled', 'Cancelled by customer', $user);
    }

    public function getUserOrders(User $user, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return Order::where('user_id', $user->id)
            ->with(['items'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    private function recordStatus(Order $order, string $status, ?string $note = null, ?User $changedBy = null): void
    {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $status,
            'note' => $note,
            'changed_by' => $changedBy?->id,
        ]);
    }
}
