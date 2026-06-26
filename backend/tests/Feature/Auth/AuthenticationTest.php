<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => UserRole::Customer->value, 'guard_name' => 'web']);
        Role::create(['name' => UserRole::Vendor->value, 'guard_name' => 'web']);
        Role::create(['name' => UserRole::Administrator->value, 'guard_name' => 'web']);
    }

    public function test_customer_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Customer',
            'email' => 'customer@nileshop.ss',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'token_type',
                    'user' => ['uuid', 'email', 'roles'],
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'customer@nileshop.ss']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'login@nileshop.ss',
            'password' => Hash::make('password123'),
        ]);
        $user->assignRole(UserRole::Customer->value);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@nileshop.ss',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'fail@nileshop.ss']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'fail@nileshop.ss',
            'password' => 'wrongpassword',
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();
        $user->assignRole(UserRole::Customer->value);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->inactive()->create([
            'email' => 'inactive@nileshop.ss',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'inactive@nileshop.ss',
            'password' => 'password123',
        ]);

        $response->assertUnprocessable();
    }
}
