<?php

namespace App\Http\Requests\Olimpiada;

use App\Enums\OlimpiadaModalidades;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;


class UpdateOlimpiadaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $allInputs = $this->all();
        Log::info('PrepareForValidation - Original inputs:', $allInputs);

        $inputs = [];

        // Procesar áreas
        if ($this->has('areas')) {
            $areas = $this->input('areas');
            if (is_string($areas)) {
                $decoded = json_decode($areas, true);
                if ($decoded === null) {
                    $areas = trim($areas, '[]');
                    $decoded = array_map('trim', explode(',', $areas));
                }
                $inputs['areas'] = array_map('intval', array_filter($decoded));
            }
        }

        // Procesar condiciones
        if ($this->has('condiciones')) {
            $condiciones = $this->input('condiciones');
            if (is_string($condiciones)) {
                $decoded = json_decode($condiciones, true);
                if ($decoded !== null) {
                    $inputs['condiciones'] = array_map(function ($condicion) {
                        return [
                            'area_id' => (int)$condicion['area_id'],
                            'nivel_unico' => (bool)($condicion['nivel_unico'] ?? false),
                            'area_exclusiva' => (bool)($condicion['area_exclusiva'] ?? false),
                        ];
                    }, $decoded);
                }
            }
        }

        // Procesar otros campos
        if ($this->has('activo')) {
            $activo = $this->input('activo');
            $inputs['activo'] = in_array(strtolower($activo), ['true', '1', 'yes', 'si', 't']) ? true : false;
        }

        if ($this->has('cupo_minimo')) {
            $inputs['cupo_minimo'] = (int) $this->input('cupo_minimo');
        }

        if ($this->has('modalidad')) {
            $inputs['modalidad'] = strtoupper($this->input('modalidad'));
        }

        foreach (['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin'] as $field) {
            if ($this->has($field)) {
                $inputs[$field] = $this->input($field);
            }
        }

        if (!empty($inputs)) {
            $this->merge($inputs);
            Log::info('Final merged inputs:', $this->all());
        }
    }

    public function rules(): array
    {
        $rules = [
            'nombre' => 'sometimes|nullable|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'cupo_minimo' => 'sometimes|nullable|integer|min:0',
            'modalidad' => [
                'sometimes',
                'nullable',
                function ($attribute, $value, $fail) {
                    if ($value && !OlimpiadaModalidades::isValid($value)) {
                        $fail("La modalidad no es válida. Valores permitidos: " . implode(', ', OlimpiadaModalidades::values()));
                    }
                }
            ],
            'areas' => 'sometimes|nullable|array',
            'areas.*' => 'integer|exists:area,id',
            'pdf_detalles' => 'sometimes|nullable|file|mimes:pdf|max:10240',
            'imagen_portada' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:10240',
            'maximo_areas' => 'sometimes|nullable|integer|min:0',
            'activo' => 'sometimes|nullable|boolean',
            'condiciones' => 'sometimes|nullable|array',
            'condiciones.*.area_id' => 'required_with:condiciones|exists:area,id',
            'condiciones.*.nivel_unico' => 'boolean',
            'condiciones.*.area_exclusiva' => 'boolean',
        ];

        return $rules;
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
            'areas.min' => 'Debe seleccionar al menos un área.',
            'pdf_detalles.mimes' => 'El archivo debe ser un PDF.',
            'pdf_detalles.max' => 'El archivo PDF no debe ser mayor a 10MB.',
            'imagen_portada.image' => 'El archivo debe ser una imagen.',
            'imagen_portada.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif.',
            'imagen_portada.max' => 'La imagen no debe ser mayor a 5MB.',
            'maximo_areas.integer' => 'El máximo de áreas debe ser un número entero.',
            'maximo_areas.min' => 'El máximo de áreas debe ser al menos 0.',
            'activo.boolean' => 'El campo activo debe ser verdadero o falso.',
            'condiciones.array' => 'Las condiciones deben ser una lista de elementos.',
            'condiciones.*.area_id.required_with' => 'Para cada condición, el área es requerida.',
            'condiciones.*.area_id.exists' => 'Una de las áreas seleccionadas en las condiciones no existe.',
            'condiciones.*.nivel_unico.boolean' => 'El campo nivel único debe ser verdadero o falso.',
            'condiciones.*.area_exclusiva.boolean' => 'El campo área exclusiva debe ser verdadero o falso.',
        ];
    }


    protected function passedValidation()
    {
        Log::info('Validation passed. Validated data:', $this->validated());
    }
}
