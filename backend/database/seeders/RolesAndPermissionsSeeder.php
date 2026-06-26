<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'users.view', 'users.create', 'users.update', 'users.delete',
            'vendors.view', 'vendors.approve', 'vendors.manage',
            'products.view', 'products.create', 'products.update', 'products.delete',
            'orders.view', 'orders.manage', 'orders.cancel',
            'settings.view', 'settings.manage',
            'reports.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $rolePermissions = [
            UserRole::Customer->value => [],
            UserRole::Vendor->value => [
                'products.view', 'products.create', 'products.update', 'products.delete',
                'orders.view',
            ],
            UserRole::DeliveryRider->value => [
                'orders.view',
            ],
            UserRole::Administrator->value => $permissions,
        ];

        foreach ($rolePermissions as $roleName => $rolePerms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($rolePerms);
        }
    }
}
