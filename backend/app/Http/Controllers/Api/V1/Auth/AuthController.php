<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\OtpPurpose;
use App\Enums\UserRole;
use App\Features\Auth\DTOs\LoginDTO;
use App\Features\Auth\DTOs\OtpRequestDTO;
use App\Features\Auth\DTOs\OtpVerifyDTO;
use App\Features\Auth\DTOs\RegisterUserDTO;
use App\Features\Auth\Services\AuthService;
use App\Features\Auth\Services\OtpService;
use App\Features\Cart\Services\CartService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\OtpSendRequest;
use App\Http\Requests\Api\V1\Auth\OtpVerifyRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Http\Requests\Api\V1\Auth\UpdateProfileRequest;
use App\Http\Requests\Api\V1\Auth\VendorRegisterRequest;
use App\Http\Resources\Api\V1\AuthTokenResource;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Authentication', description: 'User authentication and account management')]
class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly OtpService $otpService,
        private readonly CartService $cartService,
    ) {}

    #[OA\Post(
        path: '/api/v1/auth/register',
        summary: 'Register a new customer account',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                    new OA\Property(property: 'password_confirmation', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Registration successful'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function register(RegisterRequest $request): JsonResponse
    {
        $dto = new RegisterUserDTO(
            name: $request->validated('name'),
            email: $request->validated('email'),
            password: $request->validated('password'),
            phone: $request->validated('phone'),
            role: UserRole::Customer,
            locale: $request->validated('locale', 'en'),
            currency: $request->validated('currency', 'SSP'),
        );

        $user = $this->authService->register($dto);
        $tokenData = $this->authService->createTokenResponse($user, 'web');
        $this->mergeGuestCartIfNeeded($request, $tokenData['user']);

        return ApiResponse::success(
            new AuthTokenResource($tokenData),
            'Registration successful. Please verify your email.',
            201,
        );
    }

    #[OA\Post(path: '/api/v1/auth/vendor/register', summary: 'Register a new vendor account', tags: ['Authentication'])]
    public function registerVendor(VendorRegisterRequest $request): JsonResponse
    {
        $dto = new RegisterUserDTO(
            name: $request->validated('name'),
            email: $request->validated('email'),
            password: $request->validated('password'),
            phone: $request->validated('phone'),
            role: UserRole::Vendor,
            locale: $request->validated('locale', 'en'),
            currency: $request->validated('currency', 'SSP'),
        );

        $user = $this->authService->registerVendor($dto, $request->validated('store_name'));
        $tokenData = $this->authService->createTokenResponse($user, 'web');
        $this->mergeGuestCartIfNeeded($request, $tokenData['user']);

        return ApiResponse::success(
            new AuthTokenResource($tokenData),
            'Vendor registration submitted. Awaiting admin approval.',
            201,
        );
    }

    #[OA\Post(path: '/api/v1/auth/login', summary: 'Login with email and password', tags: ['Authentication'])]
    public function login(LoginRequest $request): JsonResponse
    {
        $dto = new LoginDTO(
            email: $request->validated('email'),
            password: $request->validated('password'),
            deviceName: $request->validated('device_name', 'web'),
        );

        $tokenData = $this->authService->login($dto);
        $this->mergeGuestCartIfNeeded($request, $tokenData['user']);

        return ApiResponse::success(
            new AuthTokenResource($tokenData),
            'Login successful.',
        );
    }

    #[OA\Post(path: '/api/v1/auth/logout', summary: 'Logout current session', tags: ['Authentication'], security: [['sanctum' => []]])]
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return ApiResponse::success(null, 'Logged out successfully.');
    }

    #[OA\Get(path: '/api/v1/auth/me', summary: 'Get authenticated user profile', tags: ['Authentication'], security: [['sanctum' => []]])]
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            new UserResource($request->user()->load('roles')),
        );
    }

    #[OA\Put(path: '/api/v1/auth/profile', summary: 'Update profile', tags: ['Authentication'], security: [['sanctum' => []]])]
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return ApiResponse::success(
            new UserResource($user->fresh()->load('roles')),
            'Profile updated successfully.',
        );
    }

    #[OA\Post(path: '/api/v1/auth/otp/send', summary: 'Send OTP code', tags: ['Authentication'])]
    public function sendOtp(OtpSendRequest $request): JsonResponse
    {
        $dto = new OtpRequestDTO(
            identifier: $request->validated('identifier'),
            purpose: OtpPurpose::from($request->validated('purpose')),
        );

        $this->otpService->send($dto);

        return ApiResponse::success(null, 'OTP sent successfully.');
    }

    #[OA\Post(path: '/api/v1/auth/otp/verify', summary: 'Verify OTP and login', tags: ['Authentication'])]
    public function verifyOtp(OtpVerifyRequest $request): JsonResponse
    {
        $purpose = OtpPurpose::from($request->validated('purpose'));

        $dto = new OtpVerifyDTO(
            identifier: $request->validated('identifier'),
            code: $request->validated('code'),
            purpose: $purpose,
            deviceName: $request->validated('device_name', 'web'),
        );

        $user = $this->otpService->verify($dto);

        if ($purpose === OtpPurpose::PhoneVerification) {
            return ApiResponse::success(
                new UserResource($user->load('roles')),
                'Phone verified successfully.',
            );
        }

        $tokenData = $this->authService->loginWithOtp(
            $user,
            $request->validated('device_name', 'web'),
        );
        $this->mergeGuestCartIfNeeded($request, $tokenData['user']);

        return ApiResponse::success(
            new AuthTokenResource($tokenData),
            'OTP verified successfully.',
        );
    }

    #[OA\Post(path: '/api/v1/auth/email/verification-notification', summary: 'Resend email verification', tags: ['Authentication'], security: [['sanctum' => []]])]
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $this->authService->sendEmailVerification($request->user());

        return ApiResponse::success(null, 'Verification email sent.');
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        $this->authService->verifyEmail($user, $hash);

        return ApiResponse::success(
            new UserResource($user->fresh()->load('roles')),
            'Email verified successfully.',
        );
    }

    #[OA\Post(path: '/api/v1/auth/forgot-password', summary: 'Request password reset link', tags: ['Authentication'])]
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return ApiResponse::error(__($status), 422);
        }

        return ApiResponse::success(null, 'Password reset link sent.');
    }

    #[OA\Post(path: '/api/v1/auth/reset-password', summary: 'Reset password with token', tags: ['Authentication'])]
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return ApiResponse::error(__($status), 422);
        }

        return ApiResponse::success(null, 'Password reset successfully.');
    }

    private function mergeGuestCartIfNeeded(Request $request, User $user): void
    {
        $sessionId = $request->header('X-Cart-Session');

        if (! $sessionId) {
            return;
        }

        $this->cartService->mergeGuestCart($user, $sessionId);
    }
}
