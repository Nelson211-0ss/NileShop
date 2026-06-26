<?php

namespace App\Features\Catalog\Services;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CatalogService
{
    public function getCategories(): Collection
    {
        return Category::where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();
    }

    public function getCategoryBySlug(string $slug): Category
    {
        return Category::where('slug', $slug)->where('is_active', true)->firstOrFail();
    }

    public function getBrands(int $perPage = 20): LengthAwarePaginator
    {
        return Brand::where('is_active', true)->orderBy('name')->paginate($perPage);
    }

    public function createCategory(array $data): Category
    {
        return Category::create($data);
    }

    public function createBrand(array $data): Brand
    {
        return Brand::create($data);
    }
}
