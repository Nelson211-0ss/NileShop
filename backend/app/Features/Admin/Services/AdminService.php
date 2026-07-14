<?php

namespace App\Features\Admin\Services;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;

class AdminService
{
    public function dashboardStats(): array
    {
        return [
            'total_users' => User::count(),
            'total_vendors' => Vendor::count(),
            'pending_vendors' => Vendor::where('status', 'pending')->count(),
            'total_products' => Product::count(),
            'published_products' => Product::where('status', 'published')->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'active_deliveries' => Delivery::whereIn('status', ['assigned', 'picked_up'])->count(),
            'revenue_today' => Order::where('payment_status', 'paid')
                ->whereDate('paid_at', today())->sum('total'),
            'revenue_month' => Order::where('payment_status', 'paid')
                ->whereMonth('paid_at', now()->month)->sum('total'),
        ];
    }

    public function customerActivity(?string $search, int $perPage = 20)
    {
        return User::role('customer')
            ->when($search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")))
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->withMax('orders', 'created_at')
            ->orderByDesc('orders_sum_total')
            ->paginate($perPage);
    }

    public function salesReport(int $days = 30): array
    {
        $sales = Order::where('payment_status', 'paid')
            ->where('paid_at', '>=', now()->subDays($days))
            ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(total) as revenue'), DB::raw('COUNT(*) as orders'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = Product::orderByDesc('total_sales')->limit(10)->get(['name', 'total_sales', 'price']);

        return [
            'daily_sales' => $sales,
            'top_products' => $topProducts,
            'total_revenue' => $sales->sum('revenue'),
            'total_orders' => $sales->sum('orders'),
        ];
    }
}
