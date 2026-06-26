<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Features\Wallet\Services\WalletService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private readonly WalletService $walletService) {}

    public function show(Request $request): JsonResponse
    {
        $wallet = $this->walletService->getOrCreate($request->user());
        $wallet->load('transactions');

        return ApiResponse::success([
            'balance' => $wallet->balance,
            'currency' => $wallet->currency,
            'transactions' => $wallet->transactions->map(fn ($t) => [
                'type' => $t->type,
                'amount' => $t->amount,
                'balance_after' => $t->balance_after,
                'description' => $t->description,
                'created_at' => $t->created_at->toIso8601String(),
            ]),
        ]);
    }
}
