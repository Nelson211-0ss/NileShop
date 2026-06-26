<?php

namespace App\Console\Commands;

use App\Features\Product\Services\ProductImageService;
use Illuminate\Console\Command;

class RefreshProductImagesCommand extends Command
{
    protected $signature = 'marketplace:refresh-product-images';

    protected $description = 'Download and store product images for all catalog items';

    public function handle(ProductImageService $images): int
    {
        $count = $images->refreshAll();

        $this->info("Refreshed images for {$count} products.");

        return self::SUCCESS;
    }
}
