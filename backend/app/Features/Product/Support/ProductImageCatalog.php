<?php

namespace App\Features\Product\Support;

use App\Models\Product;

class ProductImageCatalog
{
    /**
     * Deterministic placeholder images keyed by product/category slug.
     *
     * Picsum Photos is used instead of hotlinking specific Unsplash photo IDs:
     * individual Unsplash photos get taken down over time (link rot), which
     * silently breaks catalog images. Picsum's /seed/ URLs are stable and
     * always resolve, while still giving each product a distinct, consistent
     * image across reloads.
     */
    public static function resolve(Product $product): string
    {
        $seed = $product->slug ?: $product->category?->slug ?: $product->category?->parent?->slug ?: 'nileshop';

        return "https://picsum.photos/seed/{$seed}/600/600";
    }
}
