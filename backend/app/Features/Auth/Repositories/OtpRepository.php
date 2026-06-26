<?php

namespace App\Features\Auth\Repositories;

use App\Enums\OtpPurpose;
use App\Features\Auth\Repositories\Contracts\OtpRepositoryInterface;
use App\Models\OtpCode;

class OtpRepository implements OtpRepositoryInterface
{
    public function create(string $identifier, OtpPurpose $purpose, string $codeHash, \DateTimeInterface $expiresAt): OtpCode
    {
        OtpCode::where('identifier', $identifier)
            ->where('purpose', $purpose->value)
            ->whereNull('verified_at')
            ->delete();

        return OtpCode::create([
            'identifier' => $identifier,
            'purpose' => $purpose->value,
            'code_hash' => $codeHash,
            'expires_at' => $expiresAt,
        ]);
    }

    public function findLatest(string $identifier, OtpPurpose $purpose): ?OtpCode
    {
        return OtpCode::where('identifier', $identifier)
            ->where('purpose', $purpose->value)
            ->whereNull('verified_at')
            ->latest()
            ->first();
    }

    public function markVerified(OtpCode $otp): void
    {
        $otp->update(['verified_at' => now()]);
    }

    public function incrementAttempts(OtpCode $otp): void
    {
        $otp->increment('attempts');
    }

    public function deleteExpired(): int
    {
        return OtpCode::where('expires_at', '<', now())->delete();
    }
}
