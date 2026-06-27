<?php

namespace App\Features\Product\Services;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Vendor;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductService
{
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Product::query()
            ->with(['vendor', 'category', 'brand', 'images'])
            ->customerVisible();

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (! empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }
        if (! empty($filters['vendor_id'])) {
            $query->where('vendor_id', $filters['vendor_id']);
        }
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('description', 'like', '%'.$filters['search'].'%');
            });
        }
        if (! empty($filters['q'])) {
            $term = $filters['q'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', '%'.$term.'%')
                    ->orWhere('description', 'like', '%'.$term.'%');
            });
        }
        if (! empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (! empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }
        if (! empty($filters['is_featured']) || ! empty($filters['featured'])) {
            $query->where('is_featured', true);
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $allowed = ['price', 'created_at', 'rating', 'total_sales', 'name'];
        if (in_array($sort, $allowed, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        }

        return $query->paginate($perPage);
    }

    public function getBySlug(string $slug, ?int $vendorId = null): Product
    {
        $query = Product::with(['vendor', 'category', 'brand', 'images', 'variants', 'reviews' => fn ($q) => $q->where('is_approved', true)->with('user')])
            ->where('slug', $slug);

        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        } else {
            $query->customerVisible();
        }

        return $query->firstOrFail();
    }

    public function create(Vendor $vendor, array $data): Product
    {
        if (! $vendor->isApproved()) {
            throw ValidationException::withMessages(['vendor' => ['Your store must be approved before adding products.']]);
        }

        $slug = Str::slug($data['name']);
        $baseSlug = $slug;
        $counter = 1;
        while (Product::where('vendor_id', $vendor->id)->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter++;
        }

        unset($data['image_paths']);

        return Product::create([
            ...$data,
            'vendor_id' => $vendor->id,
            'slug' => $slug,
            'status' => $data['status'] ?? 'draft',
        ]);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['images', 'variants']);
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    public function addImage(
        Product $product,
        string $path,
        bool $isPrimary = false,
        ?int $sortOrder = null,
        ?string $alt = null,
    ): ProductImage {
        if ($isPrimary) {
            $product->images()->update(['is_primary' => false]);
        }

        return $product->images()->create([
            'path' => $path,
            'alt' => $alt ?? $product->name,
            'is_primary' => $isPrimary,
            'sort_order' => $sortOrder ?? (int) $product->images()->max('sort_order') + 1,
        ]);
    }

    public function syncImages(Product $product, array $paths): void
    {
        $paths = array_values(array_filter($paths, fn ($path) => is_string($path) && $path !== ''));

        $product->images()->delete();

        foreach ($paths as $index => $path) {
            $this->addImage($product, $path, $index === 0, $index, $product->name);
        }
    }

    public function search(string $query, int $perPage = 20): LengthAwarePaginator
    {
        return $this->list(['q' => $query], $perPage);
    }

    public function featured(int $limit = 12): \Illuminate\Database\Eloquent\Collection
    {
        return Product::with(['vendor', 'images'])
            ->customerVisible()
            ->where('is_featured', true)
            ->orderByDesc('total_sales')
            ->limit($limit)
            ->get();
    }

    public function bestSellers(int $limit = 12): \Illuminate\Database\Eloquent\Collection
    {
        return Product::with(['vendor', 'images'])
            ->customerVisible()
            ->orderByDesc('total_sales')
            ->limit($limit)
            ->get();
    }
}
