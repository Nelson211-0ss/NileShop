<?php

namespace App\Features\Vendor\Services;

use App\Models\Vendor;
use App\Models\VendorWallet;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class VendorService
{
    public function createForUser(User $user, string $storeName, array $extra = []): Vendor
    {
        $slug = Str::slug($storeName);
        $baseSlug = $slug;
        $counter = 1;
        while (Vendor::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter++;
        }

        $vendor = Vendor::create([
            'user_id' => $user->id,
            'store_name' => $storeName,
            'slug' => $slug,
            'contact_email' => $extra['contact_email'] ?? $user->email,
            'contact_phone' => $extra['contact_phone'] ?? $user->phone,
            'status' => 'pending',
        ]);

        VendorWallet::create(['vendor_id' => $vendor->id]);

        return $vendor;
    }

    public function approve(Vendor $vendor, User $admin): Vendor
    {
        $vendor->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $admin->id,
        ]);

        return $vendor->fresh();
    }

    public function reject(Vendor $vendor, string $reason = null): Vendor
    {
        $vendor->update(['status' => 'rejected']);

        return $vendor->fresh();
    }

    public function updateStore(Vendor $vendor, array $data): Vendor
    {
        $vendor->update($data);

        return $vendor->fresh();
    }

    public function getByUser(User $user): ?Vendor
    {
        return Vendor::where('user_id', $user->id)->first();
    }

    public function getBySlug(string $slug): Vendor
    {
        $vendor = Vendor::where('slug', $slug)->where('status', 'approved')->first();

        if (! $vendor) {
            throw ValidationException::withMessages(['vendor' => ['Store not found.']]);
        }

        return $vendor;
    }
}
