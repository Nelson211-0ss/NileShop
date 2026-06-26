<?php

namespace App\Features\Auth\Repositories\Contracts;

use App\Enums\OtpPurpose;
use App\Models\OtpCode;

interface OtpRepositoryInterface
{
    public function create(string $identifier, OtpPurpose $purpose, string $codeHash, \DateTimeInterface $expiresAt): OtpCode;

    public function findLatest(string $identifier, OtpPurpose $purpose): ?OtpCode;

    public function markVerified(OtpCode $otp): void;

    public function incrementAttempts(OtpCode $otp): void;

    public function deleteExpired(): int;
}
