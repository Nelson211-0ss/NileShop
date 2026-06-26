<?php

namespace App\Features\Product\Services;

use App\Models\Product;
use App\Models\ProductImage;
use App\Support\StorageUrl;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageService
{
    public function seedForProduct(Product $product, ?string $seed = null): ProductImage
    {
        $seed ??= Str::slug($product->name);
        $path = "products/{$product->id}.jpg";
        $disk = Storage::disk(StorageUrl::disk());

        if (! $this->storeSeedImage($disk, $path, $seed)) {
            $path = $this->fallbackUrl($seed);
        }

        $product->images()->delete();

        return $product->images()->create([
            'path' => $path,
            'alt' => $product->name,
            'is_primary' => true,
            'sort_order' => 0,
        ]);
    }

    public function refreshAll(): int
    {
        $count = 0;

        Product::query()->each(function (Product $product) use (&$count) {
            $this->seedForProduct($product);
            $count++;
        });

        return $count;
    }

    private function storeSeedImage(Filesystem $disk, string $path, string $seed): bool
    {
        if ($disk->exists($path)) {
            return true;
        }

        $content = $this->downloadSeedImage($seed);

        if ($content === null) {
            return false;
        }

        $disk->put($path, $content, ['visibility' => 'public']);

        return $disk->exists($path);
    }

    private function downloadSeedImage(string $seed): ?string
    {
        $url = 'https://picsum.photos/seed/'.rawurlencode($seed).'/600/600';
        $context = stream_context_create([
            'http' => ['timeout' => 20],
            'ssl' => ['verify_peer' => true],
        ]);

        $content = @file_get_contents($url, false, $context);

        if ($content === false || strlen($content) < 500) {
            return null;
        }

        return $content;
    }

    private function fallbackUrl(string $seed): string
    {
        return 'https://picsum.photos/seed/'.rawurlencode($seed).'/600/600';
    }
}
