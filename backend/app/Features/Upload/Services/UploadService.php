<?php

namespace App\Features\Upload\Services;

use App\Support\StorageUrl;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UploadService
{
    private string $disk;

    public function __construct()
    {
        $this->disk = config('filesystems.default') === 's3' ? 's3' : 'public';
    }

    public function uploadImage(UploadedFile $file, string $folder = 'uploads'): array
    {
        $this->validateImage($file);

        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $folder.'/'.date('Y/m').'/'.$filename;

        Storage::disk($this->disk)->put($path, file_get_contents($file->getRealPath()), 'public');

        return [
            'path' => $path,
            'url' => $this->url($path),
            'disk' => $this->disk,
        ];
    }

    public function uploadMultiple(array $files, string $folder = 'uploads'): array
    {
        return array_map(fn (UploadedFile $file) => $this->uploadImage($file, $folder), $files);
    }

    public function delete(string $path): void
    {
        if (Storage::disk($this->disk)->exists($path)) {
            Storage::disk($this->disk)->delete($path);
        }
    }

    public function url(string $path): string
    {
        return StorageUrl::forPath($path) ?? $path;
    }

    private function validateImage(UploadedFile $file): void
    {
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (! in_array($file->getMimeType(), $allowed, true)) {
            throw ValidationException::withMessages([
                'file' => ['Only JPEG, PNG, WebP, and GIF images are allowed.'],
            ]);
        }

        if ($file->getSize() > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'file' => ['Image must be smaller than 5MB.'],
            ]);
        }
    }
}
