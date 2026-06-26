<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsVendor
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isVendor()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Vendor access required.'], 403);
        }

        return $next($request);
    }
}
