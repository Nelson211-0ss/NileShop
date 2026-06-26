<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorWallet;
use App\Models\Wallet;
use App\Features\Product\Services\ProductImageService;
use App\Features\Vendor\Services\VendorService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'icon' => 'laptop'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'icon' => 'shirt'],
            ['name' => 'Home & Garden', 'slug' => 'home-garden', 'icon' => 'home'],
            ['name' => 'Health & Beauty', 'slug' => 'health-beauty', 'icon' => 'heart'],
            ['name' => 'Sports', 'slug' => 'sports', 'icon' => 'dumbbell'],
            ['name' => 'Food & Grocery', 'slug' => 'food-grocery', 'icon' => 'shopping-basket'],
        ];

        foreach ($categories as $i => $cat) {
            Category::create([...$cat, 'sort_order' => $i, 'is_active' => true]);
        }

        $electronics = Category::where('slug', 'electronics')->first();
        Category::create(['parent_id' => $electronics->id, 'name' => 'Phones', 'slug' => 'phones', 'sort_order' => 0, 'is_active' => true]);
        Category::create(['parent_id' => $electronics->id, 'name' => 'Laptops', 'slug' => 'laptops', 'sort_order' => 1, 'is_active' => true]);

        $brands = ['Samsung', 'Apple', 'Nike', 'Adidas', 'HP', 'Sony'];
        foreach ($brands as $brand) {
            Brand::create(['name' => $brand, 'slug' => Str::slug($brand), 'is_active' => true]);
        }

        $vendorService = app(VendorService::class);

        $vendorsData = [
            ['name' => 'Juba Tech Store', 'email' => 'vendor1@nileshop.ss', 'store' => 'Juba Tech Store'],
            ['name' => 'Nile Fashion', 'email' => 'vendor2@nileshop.ss', 'store' => 'Nile Fashion Hub'],
            ['name' => 'South Sudan Home', 'email' => 'vendor3@nileshop.ss', 'store' => 'South Sudan Home'],
        ];

        $vendors = [];
        foreach ($vendorsData as $vd) {
            $user = User::firstOrCreate(
                ['email' => $vd['email']],
                [
                    'name' => $vd['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'phone' => '+2119'.random_int(10000000, 99999999),
                    'is_active' => true,
                ]
            );
            $user->assignRole(UserRole::Vendor->value);
            Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 5000, 'currency' => 'SSP']);

            $vendor = Vendor::where('user_id', $user->id)->first();
            if (! $vendor) {
                $vendor = $vendorService->createForUser($user, $vd['store']);
            }
            $vendor->update([
                'status' => 'approved',
                'approved_at' => now(),
                'description' => 'Trusted seller on NileShop marketplace.',
                'city' => 'Juba',
            ]);
            $vendors[] = $vendor;
        }

        $productsData = [
            ['name' => 'Samsung Galaxy A54', 'price' => 185000, 'category' => 'phones', 'brand' => 'Samsung', 'featured' => true],
            ['name' => 'iPhone 13', 'price' => 450000, 'category' => 'phones', 'brand' => 'Apple', 'featured' => true],
            ['name' => 'HP Pavilion Laptop', 'price' => 320000, 'category' => 'laptops', 'brand' => 'HP', 'featured' => true],
            ['name' => 'Nike Air Max 90', 'price' => 95000, 'category' => 'fashion', 'brand' => 'Nike', 'featured' => false],
            ['name' => 'Adidas Running Shoes', 'price' => 85000, 'category' => 'sports', 'brand' => 'Adidas', 'featured' => false],
            ['name' => 'Sony WH-1000XM5', 'price' => 275000, 'category' => 'electronics', 'brand' => 'Sony', 'featured' => true],
            ['name' => 'Smart LED TV 55"', 'price' => 380000, 'category' => 'electronics', 'brand' => 'Samsung', 'featured' => true],
            ['name' => 'Organic Honey 500g', 'price' => 15000, 'category' => 'food-grocery', 'brand' => null, 'featured' => false],
            ['name' => 'Cotton Bed Sheet Set', 'price' => 45000, 'category' => 'home-garden', 'brand' => null, 'featured' => false],
            ['name' => 'Wireless Earbuds Pro', 'price' => 65000, 'category' => 'electronics', 'brand' => 'Samsung', 'featured' => true],
            ['name' => 'MacBook Air M2', 'price' => 890000, 'category' => 'laptops', 'brand' => 'Apple', 'featured' => true],
            ['name' => 'Sports Water Bottle', 'price' => 8000, 'category' => 'sports', 'brand' => 'Nike', 'featured' => false],
        ];

        $imageService = app(ProductImageService::class);

        foreach ($productsData as $i => $pd) {
            $vendor = $vendors[$i % count($vendors)];
            $category = Category::where('slug', $pd['category'])->first();
            $brand = $pd['brand'] ? Brand::where('name', $pd['brand'])->first() : null;
            $slug = Str::slug($pd['name']);

            $product = Product::create([
                'vendor_id' => $vendor->id,
                'category_id' => $category?->id,
                'brand_id' => $brand?->id,
                'name' => $pd['name'],
                'slug' => $slug,
                'short_description' => 'High quality '.$pd['name'].' available in South Sudan.',
                'description' => 'Premium '.$pd['name'].' with warranty. Fast delivery across Juba and nationwide.',
                'sku' => 'NS-'.strtoupper(Str::random(8)),
                'price' => $pd['price'],
                'compare_price' => $pd['price'] * 1.15,
                'stock' => random_int(10, 100),
                'weight' => random_int(1, 5),
                'status' => 'published',
                'is_featured' => $pd['featured'],
                'total_sales' => random_int(5, 200),
                'rating' => random_int(35, 50) / 10,
                'total_reviews' => random_int(3, 50),
                'warranty' => '1 Year',
                'tags' => ['popular', 'south-sudan'],
            ]);

            $imageService->seedForProduct($product, $slug);
        }

        Banner::create([
            'title' => 'Summer Sale — Up to 50% Off',
            'image' => 'banners/summer-sale.jpg',
            'link' => '/products',
            'position' => 'home',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'New Arrivals in Electronics',
            'image' => 'banners/electronics.jpg',
            'link' => '/products?category=electronics',
            'position' => 'home',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $zone = ShippingZone::create([
            'name' => 'Juba Metro',
            'regions' => ['Juba', 'Central Equatoria'],
            'is_active' => true,
        ]);

        ShippingRate::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Standard Delivery',
            'base_rate' => 500,
            'per_kg_rate' => 200,
            'min_order_free_shipping' => 50000,
            'estimated_days' => 3,
            'is_active' => true,
        ]);

        ShippingZone::create([
            'name' => 'Nationwide',
            'regions' => ['South Sudan'],
            'is_active' => true,
        ])->rates()->create([
            'name' => 'National Delivery',
            'base_rate' => 1500,
            'per_kg_rate' => 500,
            'estimated_days' => 7,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'WELCOME10',
            'name' => 'Welcome Discount',
            'type' => 'percentage',
            'value' => 10,
            'min_order_amount' => 10000,
            'max_discount' => 25000,
            'usage_limit' => 1000,
            'is_active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addYear(),
        ]);

        Coupon::create([
            'code' => 'FLAT5000',
            'name' => 'Flat 5000 SSP Off',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 30000,
            'usage_limit' => 500,
            'is_active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6),
        ]);

        $flashSale = FlashSale::create([
            'name' => 'Flash Deals',
            'description' => 'Limited time offers',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        Product::where('is_featured', true)->limit(4)->get()->each(function (Product $p) use ($flashSale) {
            FlashSaleProduct::create([
                'flash_sale_id' => $flashSale->id,
                'product_id' => $p->id,
                'sale_price' => $p->price * 0.85,
            ]);
        });

        $customer = User::firstOrCreate(
            ['email' => 'customer@nileshop.ss'],
            [
                'name' => 'Test Customer',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $customer->assignRole(UserRole::Customer->value);
        Wallet::firstOrCreate(['user_id' => $customer->id], ['balance' => 100000, 'currency' => 'SSP']);

        $rider = User::firstOrCreate(
            ['email' => 'rider@nileshop.ss'],
            [
                'name' => 'Delivery Rider',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone' => '+211912345678',
                'is_active' => true,
            ]
        );
        $rider->assignRole(UserRole::DeliveryRider->value);

        \App\Models\CmsPage::firstOrCreate(
            ['slug' => 'about'],
            [
                'title' => 'About NileShop',
                'content' => 'NileShop is South Sudan\'s leading multi-vendor e-commerce marketplace.',
                'locale' => 'en',
                'is_published' => true,
            ]
        );

        \App\Models\CmsPage::firstOrCreate(
            ['slug' => 'terms'],
            [
                'title' => 'Terms of Service',
                'content' => 'Terms and conditions for using NileShop marketplace.',
                'locale' => 'en',
                'is_published' => true,
            ]
        );

        \App\Models\SiteSetting::set('site_name', 'NileShop');
        \App\Models\SiteSetting::set('support_email', 'support@nileshop.ss');
        \App\Models\SiteSetting::set('support_phone', '+211 123 456 789');
    }
}
