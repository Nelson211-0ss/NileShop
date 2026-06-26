<?php

use App\Http\Controllers\Api\V1\Cart\CartController;
use App\Http\Controllers\Api\V1\Order\OrderController;
use App\Http\Controllers\Api\V1\Address\AddressController;
use App\Http\Controllers\Api\V1\Wishlist\WishlistController;
use App\Http\Controllers\Api\V1\Review\ReviewController;
use App\Http\Controllers\Api\V1\Wallet\WalletController;
use App\Http\Controllers\Api\V1\Coupon\CouponController;
use App\Http\Controllers\Api\V1\Product\VendorProductController;
use App\Http\Controllers\Api\V1\Vendor\VendorController;
use App\Http\Controllers\Api\V1\UploadController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\Delivery\RiderDeliveryController;
use App\Http\Controllers\Api\V1\DeviceTokenController;
use Illuminate\Support\Facades\Route;

Route::prefix('cart')->name('cart.')->group(function (): void {
    Route::get('/', [CartController::class, 'show'])->name('show');
    Route::post('items', [CartController::class, 'addItem'])->name('items.add');
    Route::put('items/{item}', [CartController::class, 'updateItem'])->name('items.update');
    Route::delete('items/{item}', [CartController::class, 'removeItem'])->name('items.remove');
    Route::delete('/', [CartController::class, 'clear'])->name('clear');
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('upload/image', [UploadController::class, 'image'])->name('upload.image');
    Route::post('upload/images', [UploadController::class, 'images'])->name('upload.images');

    Route::prefix('notifications')->name('notifications.')->group(function (): void {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('{id}/read', [NotificationController::class, 'markRead'])->name('read');
        Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
    });

    Route::post('device-tokens', [DeviceTokenController::class, 'store'])->name('device-tokens.store');
    Route::delete('device-tokens', [DeviceTokenController::class, 'destroy'])->name('device-tokens.destroy');

    Route::prefix('orders')->name('orders.')->group(function (): void {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('checkout', [OrderController::class, 'checkout'])->name('checkout');
        Route::get('{uuid}', [OrderController::class, 'show'])->name('show');
        Route::post('{uuid}/cancel', [OrderController::class, 'cancel'])->name('cancel');
    });

    Route::apiResource('addresses', AddressController::class)->except(['show']);

    Route::prefix('wishlist')->name('wishlist.')->group(function (): void {
        Route::get('/', [WishlistController::class, 'index'])->name('index');
        Route::post('/', [WishlistController::class, 'store'])->name('store');
        Route::delete('{product}', [WishlistController::class, 'destroy'])->name('destroy');
    });

    Route::post('products/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    Route::get('wallet', [WalletController::class, 'show'])->name('wallet.show');

    Route::post('coupons/validate', [CouponController::class, 'validate'])->name('coupons.validate');

    Route::middleware('vendor')->prefix('vendor')->name('vendor.')->group(function (): void {
        Route::get('store', [VendorController::class, 'myStore'])->name('store');
        Route::put('store', [VendorController::class, 'updateStore'])->name('store.update');
        Route::get('orders', [VendorController::class, 'orders'])->name('orders');
        Route::apiResource('products', VendorProductController::class);
        Route::post('products/{product}/images', [VendorProductController::class, 'addImages'])->name('products.images');
    });

    Route::middleware('rider')->prefix('rider')->name('rider.')->group(function (): void {
        Route::get('deliveries', [RiderDeliveryController::class, 'index'])->name('deliveries');
        Route::post('location', [RiderDeliveryController::class, 'updateLocation'])->name('location');
        Route::post('deliveries/{delivery}/pickup', [RiderDeliveryController::class, 'pickup'])->name('deliveries.pickup');
        Route::post('deliveries/{delivery}/complete', [RiderDeliveryController::class, 'complete'])->name('deliveries.complete');
        Route::get('earnings', [RiderDeliveryController::class, 'earnings'])->name('earnings');
    });
});
