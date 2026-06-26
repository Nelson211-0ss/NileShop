<?php

namespace App\Http\Controllers\Api\V1\Address;

use App\Features\Address\Services\AddressService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AddressResource;
use App\Models\Address;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function __construct(private readonly AddressService $addressService) {}

    public function index(Request $request): JsonResponse
    {
        return ApiResponse::success(
            AddressResource::collection($this->addressService->list($request->user()))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => 'nullable|string|max:50',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'is_default' => 'boolean',
            'type' => 'in:shipping,billing,both',
        ]);

        $address = $this->addressService->create($request->user(), $data);

        return ApiResponse::success(new AddressResource($address), 'Address created.', 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'label' => 'nullable|string|max:50',
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address_line_1' => 'sometimes|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'sometimes|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'sometimes|string|max:100',
            'is_default' => 'boolean',
        ]);

        $address = $this->addressService->update($address, $data);

        return ApiResponse::success(new AddressResource($address), 'Address updated.');
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);
        $this->addressService->delete($address);

        return ApiResponse::success(null, 'Address deleted.');
    }
}
