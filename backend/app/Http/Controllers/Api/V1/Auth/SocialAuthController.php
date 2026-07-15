<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\SocialProvider;
use App\Features\Auth\Services\AuthService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use OpenApi\Attributes as OA;
use Throwable;

#[OA\Tag(name: 'Social Authentication', description: 'Sign in with Google or Apple')]
class SocialAuthController extends Controller
{
    /** Providers exposed via these routes. Facebook exists in SocialProvider but isn't wired up yet. */
    private const SUPPORTED_PROVIDERS = [SocialProvider::Google, SocialProvider::Apple];

    public function __construct(
        private readonly AuthService $authService,
    ) {}

    #[OA\Get(
        path: '/api/v1/auth/{provider}/redirect',
        summary: 'Redirect to the social provider\'s consent screen',
        tags: ['Social Authentication'],
    )]
    public function redirect(string $provider): RedirectResponse
    {
        $this->resolveProvider($provider);

        return Socialite::driver($provider)->stateless()->redirect();
    }

    #[OA\Get(
        path: '/api/v1/auth/{provider}/callback',
        summary: 'Handle the social provider callback and redirect back to the app with a token',
        tags: ['Social Authentication'],
    )]
    public function callback(string $provider, Request $request): RedirectResponse
    {
        $resolved = $this->resolveProvider($provider);
        $frontendUrl = rtrim((string) config('frontend.url'), '/');

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $tokenData = $this->authService->loginOrRegisterSocialUser($resolved, $socialUser);

            $token = urlencode($tokenData['token']);

            return redirect()->away("{$frontendUrl}/auth/callback#token={$token}&token_type=Bearer");
        } catch (Throwable $e) {
            Log::warning('Social auth failed', ['provider' => $provider, 'error' => $e->getMessage()]);

            return redirect()->away("{$frontendUrl}/auth/login?error=social_auth_failed");
        }
    }

    private function resolveProvider(string $provider): SocialProvider
    {
        foreach (self::SUPPORTED_PROVIDERS as $supported) {
            if ($supported->value === $provider) {
                return $supported;
            }
        }

        abort(404, 'Unsupported social provider.');
    }
}
