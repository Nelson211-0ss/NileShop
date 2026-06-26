<?php

use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\Catalog\CatalogController;
use App\Http\Controllers\Api\V1\Product\ProductController;
use App\Http\Controllers\Api\V1\Vendor\VendorController;
use App\Http\Controllers\Api\V1\Shipping\ShippingController;
use Illuminate\Support\Facades\Route;

Route::get('home', [HomeController::class, 'index'])->name('home');

Route::prefix('catalog')->name('catalog.')->group(function (): void {
    Route::get('categories', [CatalogController::class, 'categories'])->name('categories');
    Route::get('categories/{slug}', [CatalogController::class, 'category'])->name('categories.show');
    Route::get('brands', [CatalogController::class, 'brands'])->name('brands');
});

Route::prefix('products')->name('products.')->group(function (): void {
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::get('search', [ProductController::class, 'search'])->name('search');
    Route::get('{slug}', [ProductController::class, 'show'])->name('show');
});

Route::get('vendors/{slug}', [VendorController::class, 'show'])->name('vendors.show');
Route::get('vendors/{slug}/products', [VendorController::class, 'products'])->name('vendors.products');

Route::get('shipping/zones', [ShippingController::class, 'zones'])->name('shipping.zones');

Route::get('pages/{slug}', [\App\Http\Controllers\Api\V1\Cms\CmsController::class, 'page'])->name('cms.page');
Route::get('settings', [\App\Http\Controllers\Api\V1\Cms\CmsController::class, 'settings'])->name('settings');

Route::post('webhooks/flutterwave', [\App\Http\Controllers\Api\V1\PaymentWebhookController::class, 'flutterwave']);
Route::post('webhooks/stripe', [\App\Http\Controllers\Api\V1\PaymentWebhookController::class, 'stripe']);

Route::get('orders/track/{uuid}', [\App\Http\Controllers\Api\V1\Order\OrderController::class, 'track'])->name('orders.track');
Route::get('deliveries/track/{delivery}', [\App\Http\Controllers\Api\V1\Delivery\AdminDeliveryController::class, 'track'])->name('deliveries.track');
