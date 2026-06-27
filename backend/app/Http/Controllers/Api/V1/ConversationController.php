<?php

namespace App\Http\Controllers\Api\V1;

use App\Features\Conversation\Services\ConversationService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ConversationMessageResource;
use App\Http\Resources\Api\V1\ConversationResource;
use App\Models\Conversation;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function __construct(private readonly ConversationService $conversations) {}

    public function index(Request $request): JsonResponse
    {
        $perspective = $request->input('perspective', 'customer');
        abort_unless(in_array($perspective, ['customer', 'vendor'], true), 422, 'Invalid perspective.');

        $items = $this->conversations->listForUser($request->user(), $perspective);

        return ApiResponse::success(
            ConversationResource::collection($items)->resolve(),
        );
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $perspective = $request->input('perspective', 'customer');
        abort_unless(in_array($perspective, ['customer', 'vendor'], true), 422, 'Invalid perspective.');

        return ApiResponse::success([
            'count' => $this->conversations->unreadCount($request->user(), $perspective),
        ]);
    }

    public function vendorIndex(Request $request): JsonResponse
    {
        $request->merge(['perspective' => 'vendor']);

        return $this->index($request);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vendor_id' => 'required|integer|exists:vendors,id',
            'product_id' => 'nullable|integer|exists:products,id',
        ]);

        $conversation = $this->conversations->findOrCreate(
            $request->user(),
            $data['vendor_id'],
            $data['product_id'] ?? null,
        );

        return ApiResponse::success(
            new ConversationResource($conversation),
            'Conversation ready.',
            201,
        );
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $conversation = $this->conversations->getForUser($request->user(), $conversation);

        return ApiResponse::success(new ConversationResource($conversation));
    }

    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $data = $request->validate([
            'body' => 'required|string|min:1|max:2000',
        ]);

        $message = $this->conversations->sendMessage($conversation, $request->user(), $data['body']);

        return ApiResponse::success(
            new ConversationMessageResource($message),
            'Message sent.',
            201,
        );
    }

    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        $this->conversations->markAsRead($conversation, $request->user());

        return ApiResponse::success(null, 'Conversation marked as read.');
    }
}
