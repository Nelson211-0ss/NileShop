<?php

namespace App\Http\Controllers\Api\V1\Review;

use App\Features\Review\Services\ReviewService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviewService) {}

    public function store(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:2000',
            'order_id' => 'nullable|exists:orders,id',
            'images' => 'nullable|array',
        ]);

        $review = $this->reviewService->create($request->user(), $product, $data);

        return ApiResponse::success(new ReviewResource($review), 'Review submitted for approval.', 201);
    }

    public function approve(Review $review): JsonResponse
    {
        $review = $this->reviewService->approve($review);

        return ApiResponse::success(new ReviewResource($review), 'Review approved.');
    }
}
