<?php

namespace App\Providers;

use App\Features\Auth\Repositories\Contracts\OtpRepositoryInterface;
use App\Features\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Features\Auth\Repositories\OtpRepository;
use App\Features\Auth\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(OtpRepositoryInterface::class, OtpRepository::class);
    }
}
