<?php

namespace App\Http\Controllers\Api\V1;

use App\Features\Upload\Services\UploadService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private readonly UploadService $uploadService) {}

    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:5120',
            'folder' => 'sometimes|string|in:products,vendors,banners,reviews,deliveries',
        ]);

        $result = $this->uploadService->uploadImage(
            $request->file('file'),
            $request->input('folder', 'uploads'),
        );

        return ApiResponse::success($result, 'File uploaded successfully.', 201);
    }

    public function images(Request $request): JsonResponse
    {
        $files = $request->file('files') ?? $request->file('images');

        $request->merge(['files' => $files]);

        $request->validate([
            'files' => 'required|array|max:10',
            'files.*' => 'image|max:5120',
            'folder' => 'sometimes|string|in:products,vendors,banners,reviews,deliveries',
        ]);

        $results = $this->uploadService->uploadMultiple(
            $request->file('files'),
            $request->input('folder', 'products'),
        );

        return ApiResponse::success($results, 'Files uploaded successfully.', 201);
    }
}
