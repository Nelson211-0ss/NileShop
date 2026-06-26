<?php

namespace App\Features\Wallet\Services;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function getOrCreate(User $user): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'currency' => $user->currency ?? 'SSP']
        );
    }

    public function deduct(User $user, float $amount, string $description, ?string $reference = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $description, $reference) {
            $wallet = $this->getOrCreate($user);

            if ($wallet->balance < $amount) {
                throw ValidationException::withMessages(['wallet' => ['Insufficient wallet balance.']]);
            }

            $wallet->decrement('balance', $amount);

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'debit',
                'amount' => $amount,
                'balance_after' => $wallet->fresh()->balance,
                'description' => $description,
                'reference' => $reference,
            ]);
        });
    }

    public function credit(User $user, float $amount, string $description, ?string $reference = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $description, $reference) {
            $wallet = $this->getOrCreate($user);
            $wallet->increment('balance', $amount);

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'balance_after' => $wallet->fresh()->balance,
                'description' => $description,
                'reference' => $reference,
            ]);
        });
    }
}
