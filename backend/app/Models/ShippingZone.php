<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingZone extends Model
{
    protected $fillable = ['name', 'regions', 'is_active'];

    protected function casts(): array
    {
        return ['regions' => 'array', 'is_active' => 'boolean'];
    }

    public function rates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ShippingRate::class);
    }
}
