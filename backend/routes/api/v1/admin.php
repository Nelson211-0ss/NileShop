<?php

use App\Http\Controllers\Api\V1\Admin\AdminController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Review\ReviewController;
use App\Http\Controllers\Api\V1\Delivery\AdminDeliveryController;
use App\Http\Controllers\Api\V1\Cms\CmsController;
use App\Http\Controllers\Api\V1\Admin\BannerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('reports', [AdminController::class, 'reports'])->name('reports');
    Route::get('vendors', [AdminController::class, 'vendors'])->name('vendors');
    Route::post('vendors/{vendor}/approve', [AdminController::class, 'approveVendor'])->name('vendors.approve');
    Route::post('vendors/{vendor}/reject', [AdminController::class, 'rejectVendor'])->name('vendors.reject');
    Route::get('users', [AdminController::class, 'users'])->name('users');
    Route::post('users/{user:uuid}/deactivate', [AdminUserController::class, 'deactivate'])->name('users.deactivate');
    Route::post('users/{user:uuid}/reactivate', [AdminUserController::class, 'reactivate'])->name('users.reactivate');
    Route::delete('users/{user:uuid}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    Route::get('customers', [AdminController::class, 'customers'])->name('customers');
    Route::get('orders', [AdminController::class, 'orders'])->name('orders');
    Route::put('orders/{order}/status', [AdminController::class, 'updateOrderStatus'])->name('orders.status');
    Route::get('products', [AdminController::class, 'products'])->name('products');
    Route::post('reviews/{review}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');

    Route::prefix('deliveries')->name('deliveries.')->group(function (): void {
        Route::get('/', [AdminDeliveryController::class, 'index'])->name('index');
        Route::post('{delivery}/assign', [AdminDeliveryController::class, 'assign'])->name('assign');
        Route::get('riders', [AdminDeliveryController::class, 'riders'])->name('riders');
    });

    Route::prefix('cms')->name('cms.')->group(function (): void {
        Route::post('pages', [CmsController::class, 'storePage'])->name('pages.store');
        Route::put('settings', [CmsController::class, 'updateSettings'])->name('settings.update');
    });

    Route::apiResource('banners', BannerController::class);
});
