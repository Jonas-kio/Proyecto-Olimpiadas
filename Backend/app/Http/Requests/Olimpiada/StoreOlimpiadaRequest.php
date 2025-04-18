<?php

namespace App\Http\Requests\Olimpiada;

use App\Enums\OlimpiadaModalidades;
use Illuminate\Foundation\Http\FormRequest;

class StoreOlimpiadaRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $inputs = [];

        // Convertir areas de string a array
        if ($this->has('areas') && is_string($this->input('areas'))) {
            $areas = $this->input('areas');

            // Intentar decodificar como JSON
            $decoded = json_decode($areas, true);

            // Si no es JSON válido, intentar otro formato
            if ($decoded === null && strpos($areas, ',') !== false) {
                $decoded = array_map('trim', explode(',', $areas));
            }
            // Si es "[1, 2]" como string y no se pudo decodificar
            elseif ($decoded === null) {
                $areas = trim($areas, '[]');
                $decoded = array_map('trim', explode(',', $areas));
            }

            $inputs['areas'] = $decoded ?: [];
        }

        // Convertir activo de string a boolean
        if ($this->has('activo') && is_string($this->input('activo'))) {
            $activo = $this->input('activo');
            $inputs['activo'] = in_array(strtolower($activo), ['true', '1', 'yes', 'si']) ? true : false;
        }

        // Convertir cupo_minimo de string a integer
        if ($this->has('cupo_minimo') && is_string($this->input('cupo_minimo'))) {
            $inputs['cupo_minimo'] = (int) $this->input('cupo_minimo');
        }

        // No es necesario convertir fechas aquí, Laravel lo hará automáticamente

        if (!empty($inputs)) {
            $this->merge($inputs);
        }
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
                        $fail("La modalidad no es válida. Valores permitidos: " . implode(', ', OlimpiadaModalidades::values()));
                    }
                }
            ],
            'areas' => 'required',
            'pdf_detalles' => 'required|file|mimes:pdf|max:10240',
            'imagen_portada' => 'required|file|mimes:jpeg,jpg,png|max:10240',
            'activo' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la olimpiada es obligatorio.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
            'modalidad.required' => 'La modalidad es obligatoria.',
            'modalidad.in' => 'La modalidad seleccionada no es válida.',
            'areas.required' => 'Debe seleccionar al menos un área.',
            'areas.min' => 'Debe seleccionar al menos un área.',
            'pdf_detalles.mimes' => 'El archivo debe ser un PDF.',
            'pdf_detalles.max' => 'El archivo PDF no debe ser mayor a 10MB.',
            'imagen_portada.image' => 'El archivo debe ser una imagen.',
            'imagen_portada.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif.',
            'imagen_portada.max' => 'La imagen no debe ser mayor a 5MB.',
        ];
    }
}
