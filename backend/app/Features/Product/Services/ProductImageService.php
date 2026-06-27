<?php

namespace App\Features\Product\Services;

use App\Features\Product\Support\ProductImageCatalog;
use App\Models\Product;
use App\Models\ProductImage;
use App\Support\StorageUrl;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

class ProductImageService
{
    public function seedForProduct(Product $product, ?string $imageUrl = null): ProductImage
    {
        $product->loadMissing('category.parent');

        $imageUrl ??= ProductImageCatalog::resolve($product);
        $path = "products/{$product->id}.jpg";
        $disk = Storage::disk(StorageUrl::disk());

        if (! $this->storeImage($disk, $path, $imageUrl)) {
            $path = $imageUrl;
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

        Product::query()->with(['category.parent'])->each(function (Product $product) use (&$count) {
            $this->seedForProduct($product);
            $count++;
        });

        return $count;
    }

    private function storeImage(Filesystem $disk, string $path, string $url): bool
    {
        if ($disk->exists($path)) {
            $disk->delete($path);
        }

        $content = $this->downloadImage($url);

        if ($content === null) {
            return false;
        }

        $disk->put($path, $content, ['visibility' => 'public']);

        return $disk->exists($path);
    }

    private function downloadImage(string $url): ?string
    {
        $context = stream_context_create([
            'http' => [
                'timeout' => 20,
                'header' => "User-Agent: NileShop/1.0\r\n",
            ],
            'ssl' => ['verify_peer' => true],
        ]);

        $content = @file_get_contents($url, false, $context);

        if ($content === false || strlen($content) < 500) {
            return null;
        }

        return $content;
    }
}
