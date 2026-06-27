<?php

namespace App\Features\Product\Support;

use App\Models\Product;

class ProductImageCatalog
{
    /** @var array<string, string> */
    private const PRODUCTS = [
        'samsung-galaxy-a54' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&h=600&q=80',
        'iphone-13' => 'https://images.unsplash.com/photo-1632661673927-9073bb4472cd?auto=format&fit=crop&w=600&h=600&q=80',
        'hp-pavilion-laptop' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&h=600&q=80',
        'nike-air-max-90' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=80',
        'adidas-running-shoes' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&h=600&q=80',
        'sony-wh-1000xm5' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=600&q=80',
        'smart-led-tv-55' => 'https://images.unsplash.com/photo-1593359673509-44848c4fac43?auto=format&fit=crop&w=600&h=600&q=80',
        'organic-honey-500g' => 'https://images.unsplash.com/photo-1587049352846-256a77066f97?auto=format&fit=crop&w=600&h=600&q=80',
        'cotton-bed-sheet-set' => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&h=600&q=80',
        'wireless-earbuds-pro' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&h=600&q=80',
        'macbook-air-m2' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&h=600&q=80',
        'sports-water-bottle' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&h=600&q=80',
    ];

    /** @var array<string, string> */
    private const CATEGORY_DEFAULTS = [
        'phones' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&h=600&q=80',
        'laptops' => 'https://images.unsplash.com/photo-1525547719573-da2b304859a2?auto=format&fit=crop&w=600&h=600&q=80',
        'electronics' => 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&h=600&q=80',
        'fashion' => 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&h=600&q=80',
        'sports' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&h=600&q=80',
        'food-grocery' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&h=600&q=80',
        'home-garden' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&h=600&q=80',
        'health-beauty' => 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&w=600&h=600&q=80',
    ];

    private const DEFAULT = 'https://images.unsplash.com/photo-1472851293608-84c544544556?auto=format&fit=crop&w=600&h=600&q=80';

    public static function resolve(Product $product): string
    {
        if ($url = self::PRODUCTS[$product->slug] ?? null) {
            return $url;
        }

        $categorySlug = $product->category?->slug;

        if ($categorySlug && isset(self::CATEGORY_DEFAULTS[$categorySlug])) {
            return self::CATEGORY_DEFAULTS[$categorySlug];
        }

        $parentSlug = $product->category?->parent?->slug;

        if ($parentSlug && isset(self::CATEGORY_DEFAULTS[$parentSlug])) {
            return self::CATEGORY_DEFAULTS[$parentSlug];
        }

        return self::DEFAULT;
    }
}
