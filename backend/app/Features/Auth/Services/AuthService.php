<?php

namespace App\Features\Auth\Services;

use App\Enums\SocialProvider;
use App\Enums\UserRole;
use App\Features\Auth\DTOs\LoginDTO;
use App\Features\Auth\DTOs\RegisterUserDTO;
use App\Features\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Features\Vendor\Services\VendorService;
use App\Models\OauthProvider;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly ActivityLogService $activityLogService,
        private readonly VendorService $vendorService,
    ) {}

    public function register(RegisterUserDTO $dto): User
    {
        if ($this->userRepository->findByEmail($dto->email) !== null) {
            throw ValidationException::withMessages([
                'email' => ['This email is already registered.'],
            ]);
        }

        if ($dto->phone !== null && $this->userRepository->findByPhone($dto->phone) !== null) {
            throw ValidationException::withMessages([
                'phone' => ['This phone number is already registered.'],
            ]);
        }

        $user = $this->userRepository->create([
            'name' => $dto->name,
            'email' => $dto->email,
            'phone' => $dto->phone,
            'password' => $dto->password,
            'locale' => $dto->locale,
            'currency' => $dto->currency,
        ]);

        $user->assignRole($dto->role->value);

        event(new Registered($user));

        $this->activityLogService->log($user, 'user.registered', $user);

        return $user;
    }

    public function login(LoginDTO $dto): array
    {
        $user = $this->userRepository->findByEmail($dto->email);

        if ($user === null || ! Hash::check($dto->password, $user->password ?? '')) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        return $this->createTokenResponse($user, $dto->deviceName ?? 'web');
    }

    public function loginWithOtp(User $user, ?string $deviceName = 'web'): array
    {
        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'identifier' => ['Your account has been deactivated.'],
            ]);
        }

        return $this->createTokenResponse($user, $deviceName ?? 'web');
    }

    public function loginOrRegisterSocialUser(
        SocialProvider $provider,
        SocialiteUser $socialUser,
        string $deviceName = 'web',
    ): array {
        $providerId = (string) $socialUser->getId();

        $link = OauthProvider::where('provider', $provider)
            ->where('provider_id', $providerId)
            ->first();

        if ($link !== null) {
            $user = $link->user;
        } else {
            $email = $socialUser->getEmail();
            $user = $email !== null ? $this->userRepository->findByEmail($email) : null;

            if ($user === null) {
                $user = $this->userRepository->create([
                    'name' => $socialUser->getName() ?: ($socialUser->getNickname() ?: 'NileShop User'),
                    'email' => $email ?? "{$provider->value}-{$providerId}@social.nileshop.ss",
                    'password' => null,
                    'avatar' => $socialUser->getAvatar(),
                    'locale' => 'en',
                    'currency' => 'SSP',
                    'email_verified_at' => $email !== null ? now() : null,
                ]);

                $user->assignRole(UserRole::Customer->value);

                event(new Registered($user));
            } elseif ($user->email_verified_at === null && $email !== null) {
                $this->userRepository->update($user, ['email_verified_at' => now()]);
            }

            OauthProvider::create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_id' => $providerId,
                'provider_email' => $email,
                'avatar' => $socialUser->getAvatar(),
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        $this->activityLogService->log($user, 'user.social_login', $user);

        return $this->createTokenResponse($user, $deviceName);
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();

        $this->activityLogService->log($user, 'user.logout', $user);
    }

    public function createTokenResponse(User $user, string $deviceName): array
    {
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken($deviceName)->plainTextToken;

        $this->userRepository->update($user, [
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);

        $this->activityLogService->log($user, 'user.login', $user);

        return [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles'),
        ];
    }

    public function sendEmailVerification(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Email is already verified.'],
            ]);
        }

        $user->notify(new VerifyEmailNotification());
    }

    public function verifyEmail(User $user, string $hash): void
    {
        if (! hash_equals((string) sha1($user->getEmailForVerification()), $hash)) {
            throw ValidationException::withMessages([
                'hash' => ['Invalid verification link.'],
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return;
        }

        $user->markEmailAsVerified();

        $this->activityLogService->log($user, 'user.email_verified', $user);
    }

    public function registerVendor(RegisterUserDTO $dto, string $storeName): User
    {
        $dto = new RegisterUserDTO(
            name: $dto->name,
            email: $dto->email,
            password: $dto->password,
            phone: $dto->phone,
            role: UserRole::Vendor,
            locale: $dto->locale,
            currency: $dto->currency,
        );

        $user = $this->register($dto);
        $this->vendorService->createForUser($user, $storeName, [
            'contact_email' => $dto->email,
            'contact_phone' => $dto->phone,
        ]);

        return $user;
    }
}
