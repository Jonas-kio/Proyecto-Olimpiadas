<?php

namespace App\Http\Requests\CategoryLevelRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Enums\GradeName;

class CategoryLevelStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'area_id' => 'required|exists:area,id',
            'grade_name' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (!GradeName::isValid($value)) {
                        $fail("El nombre de grado no es válido. Valores permitidos: " . implode(', ', GradeName::values()));
                    }
                }
            ],
            'name' => 'required|string|max:20',
            'description' => 'required|string|max:150',
            'grade_min' => 'required|string|max:3',
            'grade_max' => 'nullable|string|max:3'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Error de validación',
            'errors' => $validator->errors()
        ], 422));
    }
}
