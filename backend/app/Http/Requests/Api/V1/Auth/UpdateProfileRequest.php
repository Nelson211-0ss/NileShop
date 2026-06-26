<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', 'unique:users,phone,'.$this->user()->id],
            'locale' => ['sometimes', 'string', 'in:en,ar'],
            'currency' => ['sometimes', 'string', 'in:SSP'],
            'timezone' => ['sometimes', 'string', 'max:64'],
        ];
    }
}
