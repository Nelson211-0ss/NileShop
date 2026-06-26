<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Product extends Model
{
    use Searchable, SoftDeletes;

    protected $fillable = [
        'vendor_id', 'category_id', 'brand_id', 'name', 'slug', 'short_description',
        'description', 'sku', 'barcode', 'price', 'compare_price', 'cost_price',
        'stock', 'low_stock_threshold', 'weight', 'dimensions', 'status', 'is_featured',
        'is_digital', 'specifications', 'warranty', 'tags', 'meta_title', 'meta_description',
        'rating', 'total_reviews', 'total_sales',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'weight' => 'decimal:2',
            'dimensions' => 'array',
            'specifications' => 'array',
            'tags' => 'array',
            'is_featured' => 'boolean',
            'is_digital' => 'boolean',
            'rating' => 'decimal:2',
        ];
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->short_description,
            'sku' => $this->sku,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'vendor_id' => $this->vendor_id,
            'price' => $this->price,
            'status' => $this->status,
            'rating' => $this->rating,
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function primaryImage(): ?ProductImage
    {
        return $this->images()->where('is_primary', true)->first()
            ?? $this->images()->first();
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function inStock(): bool
    {
        return $this->stock > 0;
    }

    /** Products customers can browse and purchase. */
    public function scopeCustomerVisible(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->whereHas('vendor', fn (Builder $q) => $q->where('status', 'approved'));
    }
}
