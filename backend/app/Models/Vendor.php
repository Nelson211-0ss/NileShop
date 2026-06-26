<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'store_name', 'slug', 'logo', 'banner', 'description', 'policies',
        'store_hours', 'status', 'commission_rate', 'rating', 'total_reviews',
        'is_featured', 'contact_email', 'contact_phone', 'address', 'city', 'country',
        'approved_at', 'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'store_hours' => 'array',
            'is_featured' => 'boolean',
            'commission_rate' => 'decimal:2',
            'rating' => 'decimal:2',
            'approved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function wallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(VendorWallet::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
