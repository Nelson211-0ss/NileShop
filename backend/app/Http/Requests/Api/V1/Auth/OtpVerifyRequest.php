<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Enums\OtpPurpose;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OtpVerifyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'code' => ['required', 'string', 'size:6'],
            'purpose' => ['required', 'string', Rule::enum(OtpPurpose::class)],
            'device_name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
