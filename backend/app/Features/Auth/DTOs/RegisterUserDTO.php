<?php

namespace App\Features\Auth\DTOs;

use App\Enums\UserRole;

readonly class RegisterUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $phone = null,
        public UserRole $role = UserRole::Customer,
        public string $locale = 'en',
        public string $currency = 'SSP',
    ) {}
}
