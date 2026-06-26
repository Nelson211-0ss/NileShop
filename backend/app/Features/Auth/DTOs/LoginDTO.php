<?php

namespace App\Features\Auth\DTOs;

readonly class LoginDTO
{
    public function __construct(
        public string $email,
        public string $password,
        public ?string $deviceName = 'web',
    ) {}
}
