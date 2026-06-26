<?php

namespace App\Features\Auth\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function findByPhone(string $phone): ?User;

    public function findByUuid(string $uuid): ?User;

    public function create(array $attributes): User;

    public function update(User $user, array $attributes): User;
}
