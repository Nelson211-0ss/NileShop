<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        return ApiResponse::success(Banner::orderBy('sort_order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|string',
            'link' => 'nullable|string',
            'position' => 'string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $banner = Banner::create($data);

        return ApiResponse::success($banner, 'Banner created.', 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'image' => 'sometimes|string',
            'link' => 'nullable|string',
            'position' => 'string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $banner->update($data);

        return ApiResponse::success($banner->fresh(), 'Banner updated.');
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();

        return ApiResponse::success(null, 'Banner deleted.');
    }
}
