<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class StorageUrl
{
    public static function disk(): string
    {
        return config('filesystems.default') === 's3' ? 's3' : 'public';
    }

    public static function forPath(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return Storage::disk(self::disk())->url($path);
    }
}
