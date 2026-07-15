<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminUserController extends Controller
{
    public function deactivate(Request $request, User $user): JsonResponse
    {
        $this->guardSelfAction($request, $user, 'deactivate');
        $this->guardLastAdmin($user, 'deactivate');

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return ApiResponse::success(
            new UserResource($user->fresh()->load('roles')),
            'Account deactivated.',
        );
    }

    public function reactivate(Request $request, User $user): JsonResponse
    {
        $user->update(['is_active' => true]);

        return ApiResponse::success(
            new UserResource($user->fresh()->load('roles')),
            'Account reactivated.',
        );
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->guardSelfAction($request, $user, 'delete');
        $this->guardLastAdmin($user, 'delete');

        $user->tokens()->delete();
        $user->delete();

        return ApiResponse::success(null, 'Account deleted.');
    }

    private function guardSelfAction(Request $request, User $user, string $action): void
    {
        if ($request->user()->id === $user->id) {
            throw ValidationException::withMessages([
                'user' => ["You cannot {$action} your own account."],
            ]);
        }
    }

    private function guardLastAdmin(User $user, string $action): void
    {
        if (! $user->hasRole(UserRole::Administrator->value)) {
            return;
        }

        $activeAdminCount = User::role(UserRole::Administrator->value)
            ->where('is_active', true)
            ->count();

        if ($activeAdminCount <= 1) {
            throw ValidationException::withMessages([
                'user' => ["You cannot {$action} the last active administrator."],
            ]);
        }
    }
}
