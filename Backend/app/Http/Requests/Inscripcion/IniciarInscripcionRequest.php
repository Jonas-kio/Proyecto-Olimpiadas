<?php

namespace App\Http\Requests\Inscripcion;

use Illuminate\Foundation\Http\FormRequest;

class IniciarInscripcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'competitor_id' => 'required|exists:competitor,id',
            'tutor_id' => 'required|exists:tutor,id',
            'olimpiada_id' => 'required|exists:olimpiadas,id',
            'area_id' => 'required|exists:area,id',
            'category_level_id' => 'required|exists:category_level,id',
        ];
    }

    public function messages(): array
    {
        return [
            'competitor_id.required' => 'El ID del competidor es requerido',
            'competitor_id.exists' => 'El competidor seleccionado no existe',
            'tutor_id.required' => 'El ID del tutor es requerido',
            'tutor_id.exists' => 'El tutor seleccionado no existe',
            'olimpiada_id.required' => 'El ID de la olimpiada es requerido',
            'olimpiada_id.exists' => 'La olimpiada seleccionada no existe',
            'area_id.required' => 'El ID del área es requerido',
            'area_id.exists' => 'El área seleccionada no existe',
            'category_level_id.required' => 'El ID del nivel es requerido',
            'category_level_id.exists' => 'El nivel seleccionado no existe',
        ];
    }
}
