<?php

namespace App\Features\Auth\Services;

use App\Enums\OtpPurpose;
use App\Features\Auth\DTOs\OtpRequestDTO;
use App\Features\Auth\DTOs\OtpVerifyDTO;
use App\Features\Auth\Repositories\Contracts\OtpRepositoryInterface;
use App\Features\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Features\Notification\Services\SmsService;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function __construct(
        private readonly OtpRepositoryInterface $otpRepository,
        private readonly UserRepositoryInterface $userRepository,
        private readonly SmsService $smsService,
    ) {}

    public function send(OtpRequestDTO $dto): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiryMinutes = (int) config('auth.otp_expiry_minutes', 10);

        $this->otpRepository->create(
            $dto->identifier,
            $dto->purpose,
            Hash::make($code),
            now()->addMinutes($expiryMinutes),
        );

        // Send via SMS for phone identifiers
        if (str_starts_with($dto->identifier, '+') || preg_match('/^\d{9,15}$/', $dto->identifier)) {
            $this->smsService->sendOtp($dto->identifier, $code);
        }

        if (config('app.debug')) {
            logger()->info("OTP for {$dto->identifier}: {$code}");
        }
    }

    public function verify(OtpVerifyDTO $dto): User
    {
        $otp = $this->otpRepository->findLatest($dto->identifier, $dto->purpose);

        if ($otp === null || $otp->isExpired()) {
            throw ValidationException::withMessages([
                'code' => ['The OTP code is invalid or has expired.'],
            ]);
        }

        $maxAttempts = (int) config('auth.otp_max_attempts', 5);

        if ($otp->attempts >= $maxAttempts) {
            throw ValidationException::withMessages([
                'code' => ['Too many failed attempts. Please request a new code.'],
            ]);
        }

        if (! Hash::check($dto->code, $otp->code_hash)) {
            $this->otpRepository->incrementAttempts($otp);

            throw ValidationException::withMessages([
                'code' => ['The OTP code is invalid.'],
            ]);
        }

        $this->otpRepository->markVerified($otp);

        return $this->resolveUser($dto->identifier, $dto->purpose);
    }

    private function resolveUser(string $identifier, OtpPurpose $purpose): User
    {
        if ($purpose === OtpPurpose::PhoneVerification) {
            $user = $this->userRepository->findByPhone($identifier);

            if ($user === null) {
                throw ValidationException::withMessages([
                    'phone' => ['No account found with this phone number.'],
                ]);
            }

            $this->userRepository->update($user, ['phone_verified_at' => now()]);

            return $user->fresh();
        }

        $user = $this->userRepository->findByPhone($identifier)
            ?? $this->userRepository->findByEmail($identifier);

        if ($user === null) {
            throw ValidationException::withMessages([
                'identifier' => ['No account found.'],
            ]);
        }

        return $user;
    }
}
