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
        return [
            'nombre' => 'sometimes|nullable|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'fecha_inicio' => 'sometimes|nullable|date',
            'fecha_fin' => 'sometimes|nullable|date|after_or_equal:fecha_inicio',
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
            'areas.*' => 'integer|exists:areas,id',
            'pdf_detalles' => 'sometimes|nullable|file|mimes:pdf|max:10240',
            'imagen_portada' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:10240',
            'activo' => 'sometimes|nullable|boolean',
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
            'areas.min' => 'Debe seleccionar al menos un área.',
            'pdf_detalles.mimes' => 'El archivo debe ser un PDF.',
            'pdf_detalles.max' => 'El archivo PDF no debe ser mayor a 10MB.',
            'imagen_portada.image' => 'El archivo debe ser una imagen.',
            'imagen_portada.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif.',
            'imagen_portada.max' => 'La imagen no debe ser mayor a 5MB.',
        ];
    }

    protected function passedValidation()
    {
        Log::info('Validation passed. Validated data:', $this->validated());
    }
}
