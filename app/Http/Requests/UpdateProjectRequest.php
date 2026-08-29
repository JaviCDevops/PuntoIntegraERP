<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('projects') ?? false;
    }

    public function rules(): array
    {
        return [
            'oc_number' => 'nullable|string|max:255',
            'internal_notes' => 'nullable|string',
            'start_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'area_id' => 'nullable|exists:areas,id',
            'reminder_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'status' => 'nullable|string',

            'milestones' => 'nullable|array',
            'milestones.*.id' => 'nullable|integer',
            'milestones.*.milestone_order' => 'required|integer|min:1',
            'milestones.*.percentage' => 'required|numeric|min:0|max:100',
            'milestones.*.amount' => 'nullable|numeric|min:0',
            'milestones.*.status' => 'nullable|string',
            'milestones.*.invoice_number' => 'nullable|string',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $milestones = $this->input('milestones', []);

            if (empty($milestones)) {
                return;
            }

            $totalPercentage = collect($milestones)->sum(fn ($m) => (float) ($m['percentage'] ?? 0));

            if (abs($totalPercentage - 100) > 0.01) {
                $validator->errors()->add(
                    'milestones',
                    "La suma total de los porcentajes debe ser exactamente 100%. Actualmente suma: {$totalPercentage}%"
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'milestones.*.percentage.min' => 'Cada porcentaje debe ser mayor o igual a 0.',
            'milestones.*.percentage.max' => 'Cada porcentaje no puede superar 100.',
            'milestones.*.amount.min' => 'El monto en UF no puede ser negativo.',
        ];
    }
}
