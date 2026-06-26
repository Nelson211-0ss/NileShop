<?php

return [
    'driver' => env('SCOUT_DRIVER', 'collection'),
    'prefix' => env('SCOUT_PREFIX', ''),
    'queue' => env('SCOUT_QUEUE', false),
    'after_commit' => false,
    'chunk' => [
        'searchable' => 500,
        'unsearchable' => 500,
    ],
    'soft_delete' => false,
    'identify' => env('SCOUT_IDENTIFY', false),
    'algolia' => [
        'id' => env('ALGOLIA_ID', ''),
        'secret' => env('ALGOLIA_SECRET', ''),
    ],
    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
        'key' => env('MEILISEARCH_KEY', ''),
        'index-settings' => [
            \App\Models\Product::class => [
                'filterableAttributes' => ['category_id', 'brand_id', 'vendor_id', 'status', 'price'],
                'sortableAttributes' => ['price', 'rating', 'total_sales', 'created_at'],
            ],
        ],
    ],
];
