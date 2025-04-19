<?php

namespace App\Http\Requests\Olimpiada;

use App\Enums\OlimpiadaModalidades;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOlimpiadaRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'cupo_minimo' => 'nullable|integer|min:0',
            'modalidad' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!OlimpiadaModalidades::isValid($value)) {
                        $fail("El nombre de grado no es válido. Valores permitidos: " . implode(', ', OlimpiadaModalidades::values()));
                    }
                }
            ],
            'areas' => 'sometimes|array|min:1',
            'areas.*' => 'exists:area,id',
            'pdf_detalles' => 'nullable|file|mimes:pdf|max:10240',
            'imagen_portada' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'activo' => 'boolean',
        ];
    }

    /**
     * Obtener los mensajes de error para las reglas de validación definidas.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la olimpiada es obligatorio.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
            'modalidad.required' => 'La modalidad es obligatoria.',
            'modalidad.in' => 'La modalidad seleccionada no es válida.',
            'areas.min' => 'Debe seleccionar al menos un área.',
            'pdf_detalles.mimes' => 'El archivo debe ser un PDF.',
            'pdf_detalles.max' => 'El archivo PDF no debe ser mayor a 10MB.',
            'imagen_portada.image' => 'El archivo debe ser una imagen.',
            'imagen_portada.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif.',
            'imagen_portada.max' => 'La imagen no debe ser mayor a 5MB.',
        ];
    }
}
