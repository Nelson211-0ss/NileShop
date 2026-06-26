<?php

namespace App\Features\Auth\DTOs;

use App\Enums\OtpPurpose;

readonly class OtpVerifyDTO
{
    public function __construct(
        public string $identifier,
        public string $code,
        public OtpPurpose $purpose,
        public ?string $deviceName = 'web',
    ) {}
}
