<?php

namespace App\Features\Address\Services;

use App\Models\Address;
use App\Models\User;

class AddressService
{
    public function list(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return Address::where('user_id', $user->id)->orderByDesc('is_default')->get();
    }

    public function create(User $user, array $data): Address
    {
        if ($data['is_default'] ?? false) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        return Address::create([...$data, 'user_id' => $user->id]);
    }

    public function update(Address $address, array $data): Address
    {
        if ($data['is_default'] ?? false) {
            Address::where('user_id', $address->user_id)->update(['is_default' => false]);
        }

        $address->update($data);

        return $address->fresh();
    }

    public function delete(Address $address): void
    {
        $address->delete();
    }
}
