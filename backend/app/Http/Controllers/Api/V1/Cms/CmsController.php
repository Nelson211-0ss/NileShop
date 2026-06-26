<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CmsController extends Controller
{
    public function page(string $slug): JsonResponse
    {
        $page = CmsPage::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return ApiResponse::success([
            'title' => $page->title,
            'slug' => $page->slug,
            'content' => $page->content,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
        ]);
    }

    public function settings(): JsonResponse
    {
        $settings = SiteSetting::all()->groupBy('group')->map(fn ($group) =>
            $group->pluck('value', 'key')
        );

        return ApiResponse::success($settings);
    }

    public function storePage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'locale' => 'in:en,ar',
            'is_published' => 'boolean',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
        ]);

        $page = CmsPage::create([
            ...$data,
            'slug' => Str::slug($data['title']),
            'locale' => $data['locale'] ?? 'en',
        ]);

        return ApiResponse::success($page, 'Page created.', 201);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate(['settings' => 'required|array']);

        foreach ($data['settings'] as $key => $value) {
            SiteSetting::set($key, $value);
        }

        return ApiResponse::success(null, 'Settings updated.');
    }
}
