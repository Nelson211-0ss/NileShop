<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Enums\OtpPurpose;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OtpSendRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'purpose' => ['required', 'string', Rule::enum(OtpPurpose::class)],
        ];
    }
}
