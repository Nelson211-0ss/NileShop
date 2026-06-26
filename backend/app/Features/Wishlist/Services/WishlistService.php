<?php

namespace App\Features\Wishlist\Services;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;

class WishlistService
{
    public function list(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return Wishlist::where('user_id', $user->id)
            ->with(['product.images', 'product.vendor'])
            ->get();
    }

    public function add(User $user, Product $product): Wishlist
    {
        return Wishlist::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function remove(User $user, Product $product): void
    {
        Wishlist::where('user_id', $user->id)->where('product_id', $product->id)->delete();
    }
}
