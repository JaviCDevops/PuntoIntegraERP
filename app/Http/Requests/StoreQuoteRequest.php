<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('quotes') ?? false;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'area' => 'required|string|exists:areas,name',
            'description' => 'nullable|string|max:255',
            'net_value' => 'required|numeric|min:0',
            'valid_until' => 'required|date|after:today',
            'reminder_date' => 'nullable|date|before_or_equal:valid_until',
        ];
    }

    public function messages(): array
    {
        return [
            'net_value.min' => 'El valor neto no puede ser negativo.',
        ];
    }
}
