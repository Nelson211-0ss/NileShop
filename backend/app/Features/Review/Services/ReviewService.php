<?php

namespace App\Features\Review\Services;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;

class ReviewService
{
    public function create(User $user, Product $product, array $data): Review
    {
        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $data['order_id'] ?? null,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'comment' => $data['comment'] ?? null,
            'images' => $data['images'] ?? null,
            'is_approved' => false,
        ]);

        $this->updateProductRating($product);

        return $review;
    }

    public function approve(Review $review): Review
    {
        $review->update(['is_approved' => true]);
        $this->updateProductRating($review->product);

        return $review->fresh();
    }

    private function updateProductRating(Product $product): void
    {
        $stats = Review::where('product_id', $product->id)->where('is_approved', true);
        $product->update([
            'rating' => $stats->avg('rating') ?? 0,
            'total_reviews' => $stats->count(),
        ]);
    }
}
