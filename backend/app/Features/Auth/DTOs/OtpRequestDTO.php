<?php

namespace App\Features\Auth\DTOs;

use App\Enums\OtpPurpose;

readonly class OtpRequestDTO
{
    public function __construct(
        public string $identifier,
        public OtpPurpose $purpose,
    ) {}
}
