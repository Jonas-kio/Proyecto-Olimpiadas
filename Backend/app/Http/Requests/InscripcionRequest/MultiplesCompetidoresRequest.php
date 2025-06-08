<?php

namespace App\Http\Requests\InscripcionRequest;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class MultiplesCompetidoresRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'competidores' => 'required|array|min:1',
            'competidores.*.nombres' => 'required|string|max:255',
            'competidores.*.apellidos' => 'required|string|max:255',
            'competidores.*.documento_identidad' => 'required|string|max:20|unique:competitor',
            'competidores.*.provincia' => 'required|string|max:100',
            'competidores.*.fecha_nacimiento' => 'required|date',
            'competidores.*.curso' => 'required|string|max:100',
            'competidores.*.correo_electronico' => 'required|email|unique:competitor',
            'competidores.*.colegio' => 'required|string|max:255',
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
