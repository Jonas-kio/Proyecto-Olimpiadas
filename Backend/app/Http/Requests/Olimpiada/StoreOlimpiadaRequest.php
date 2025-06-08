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

        \Illuminate\Support\Facades\Log::info('prepareForValidation: iniciando procesamiento de datos', [
            'todos_los_campos' => $this->all(),
            'method' => $this->method(),
            'content_type' => $this->header('Content-Type')
        ]);

        // Procesando nombre
        if ($this->has('nombre')) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando nombre', [
                'nombre' => $this->input('nombre'),
                'tipo' => gettype($this->input('nombre'))
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el campo nombre');
        }

        // Procesando descripcion
        if ($this->has('descripcion')) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando descripcion', [
                'descripcion' => $this->input('descripcion'),
                'tipo' => gettype($this->input('descripcion'))
            ]);
        }

        // Procesando fechas
        if ($this->has('fecha_inicio')) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando fecha_inicio', [
                'fecha_inicio' => $this->input('fecha_inicio'),
                'tipo' => gettype($this->input('fecha_inicio'))
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el campo fecha_inicio');
        }

        if ($this->has('fecha_fin')) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando fecha_fin', [
                'fecha_fin' => $this->input('fecha_fin'),
                'tipo' => gettype($this->input('fecha_fin'))
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el campo fecha_fin');
        }

        // Procesando modalidad
        if ($this->has('modalidad')) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando modalidad', [
                'modalidad' => $this->input('modalidad'),
                'tipo' => gettype($this->input('modalidad'))
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el campo modalidad');
        }

        // Procesando maximo_areas
        if ($this->has('maximo_areas')) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando maximo_areas', [
                'maximo_areas' => $this->input('maximo_areas'),
                'tipo' => gettype($this->input('maximo_areas'))
            ]);

            if (is_string($this->input('maximo_areas'))) {
                $inputs['maximo_areas'] = (int) $this->input('maximo_areas');
                \Illuminate\Support\Facades\Log::info('prepareForValidation: maximo_areas convertido', [
                    'valor_convertido' => $inputs['maximo_areas']
                ]);
            }
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el campo maximo_areas');
        }

        // Procesando cupo_minimo
        if ($this->has('cupo_minimo')) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando cupo_minimo', [
                'cupo_minimo' => $this->input('cupo_minimo'),
                'tipo' => gettype($this->input('cupo_minimo'))
            ]);

            if (is_string($this->input('cupo_minimo'))) {
                $inputs['cupo_minimo'] = (int) $this->input('cupo_minimo');
                \Illuminate\Support\Facades\Log::info('prepareForValidation: cupo_minimo convertido', [
                    'valor_convertido' => $inputs['cupo_minimo']
                ]);
            }
        }

        // Procesando archivos
        if ($this->hasFile('pdf_detalles')) {
            $file = $this->file('pdf_detalles');
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando pdf_detalles', [
                'nombre_original' => $file->getClientOriginalName(),
                'tipo' => $file->getMimeType(),
                'tamaño' => $file->getSize()
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el archivo pdf_detalles');
        }

        if ($this->hasFile('imagen_portada')) {
            $file = $this->file('imagen_portada');
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando imagen_portada', [
                'nombre_original' => $file->getClientOriginalName(),
                'tipo' => $file->getMimeType(),
                'tamaño' => $file->getSize()
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el archivo imagen_portada');
        }

        // Procesando áreas
        if ($this->has('areas')) {
            $areas = $this->input('areas');
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando areas', [
                'areas_raw' => $areas,
                'areas_type' => gettype($areas)
            ]);

            // Si ya es un array, no hacemos nada
            if (is_array($areas)) {
                \Illuminate\Support\Facades\Log::info('prepareForValidation: areas ya es un array', ['areas' => $areas]);
                $inputs['areas'] = $areas;
            }
            // Si es una cadena, intentamos convertirla
            else if (is_string($areas)) {
                // Intentar decodificar como JSON
                $decoded = json_decode($areas, true);
                \Illuminate\Support\Facades\Log::info('prepareForValidation: intento de decodificación JSON de areas', [
                    'resultado' => $decoded !== null ? 'exitoso' : 'fallido',
                    'json_error' => json_last_error_msg()
                ]);

                // Si no es JSON válido, intentamos otras formas
                if ($decoded === null) {
                    \Illuminate\Support\Facades\Log::info('prepareForValidation: intentando procesar areas como cadena', [
                        'areas_string' => $areas,
                        'contiene_comas' => strpos($areas, ',') !== false
                    ]);

                    if (strpos($areas, ',') !== false) {
                        // Si contiene comas, separamos por comas
                        $decoded = array_map('trim', explode(',', $areas));
                        \Illuminate\Support\Facades\Log::info('prepareForValidation: areas separadas por comas', [
                            'resultado' => $decoded
                        ]);
                    } else {
                        // De lo contrario, limpiamos corchetes y separamos
                        $areas = trim($areas, '[]');
                        $decoded = array_map('trim', explode(',', $areas));
                        \Illuminate\Support\Facades\Log::info('prepareForValidation: areas procesadas como array', [
                            'areas_sin_corchetes' => $areas,
                            'resultado' => $decoded
                        ]);
                    }
                }

                // Filtrar valores vacíos y convertir a enteros
                $original_decoded = $decoded;
                $decoded = array_filter(array_map('intval', $decoded ?: []));
                \Illuminate\Support\Facades\Log::info('prepareForValidation: areas procesado desde string', [
                    'areas_original' => $original_decoded,
                    'areas_decoded' => $decoded
                ]);

                $inputs['areas'] = $decoded;
            } else {
                \Illuminate\Support\Facades\Log::warning('prepareForValidation: formato de areas no reconocido', [
                    'tipo' => gettype($areas)
                ]);
            }
        } else {
            \Illuminate\Support\Facades\Log::warning('prepareForValidation: no se encontró el campo areas');
        }

        // Procesamiento de condiciones
        if ($this->has('condiciones')) {
            $condiciones = $this->input('condiciones');
            \Illuminate\Support\Facades\Log::info('prepareForValidation: procesando condiciones', [
                'condiciones_raw' => $condiciones,
                'condiciones_type' => gettype($condiciones)
            ]);

            if (is_array($condiciones)) {
                \Illuminate\Support\Facades\Log::info('prepareForValidation: condiciones ya es un array', [
                    'condiciones' => $condiciones
                ]);
                $inputs['condiciones'] = $condiciones;
            } else if (is_string($condiciones)) {
                $decoded = json_decode($condiciones, true);
                \Illuminate\Support\Facades\Log::info('prepareForValidation: decodificando condiciones JSON', [
                    'resultado' => $decoded !== null ? 'exitoso' : 'fallido',
                    'json_error' => json_last_error_msg()
                ]);

                $inputs['condiciones'] = $decoded ?: [];
                \Illuminate\Support\Facades\Log::info('prepareForValidation: condiciones procesadas', [
                    'condiciones_processed' => $inputs['condiciones']
                ]);
            } else {
                \Illuminate\Support\Facades\Log::warning('prepareForValidation: formato de condiciones no reconocido', [
                    'tipo' => gettype($condiciones)
                ]);
            }
        }

        if (!empty($inputs)) {
            \Illuminate\Support\Facades\Log::info('prepareForValidation: fusionando inputs procesados', [
                'inputs' => $inputs
            ]);
            $this->merge($inputs);
        }

        \Illuminate\Support\Facades\Log::info('prepareForValidation: preparación completada', [
            'request_final' => $this->all()
        ]);
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
            'cupo_minimo' => 'nullable|integer|min:0',
            'modalidad' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!OlimpiadaModalidades::isValid($value)) {
                        $fail("La modalidad no es válida. Valores permitidos: " . implode(', ', OlimpiadaModalidades::values()));
                    }
                }
            ],
            'areas' => 'required|array|min:1',
            'pdf_detalles' => 'required|file|mimes:pdf|max:10240',
            'imagen_portada' => 'required|file|mimes:jpeg,jpg,png|max:10240',
            'maximo_areas' => 'required|integer|min:1',
            'condiciones' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la olimpiada es obligatorio.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.after_or_equal' => 'La fecha de inicio debe ser igual o posterior a la fecha actual.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
            'modalidad.required' => 'La modalidad es obligatoria.',
            'modalidad.in' => 'La modalidad seleccionada no es válida.',
            'areas.required' => 'Debe seleccionar al menos un área.',
            'areas.min' => 'Debe seleccionar al menos un área.',
            'pdf_detalles.required' => 'El archivo PDF con los detalles es obligatorio.',
            'pdf_detalles.mimes' => 'El archivo debe ser un PDF.',
            'pdf_detalles.max' => 'El archivo PDF no debe ser mayor a 10MB.',
            'imagen_portada.required' => 'La imagen de portada es obligatoria.',
            'imagen_portada.image' => 'El archivo debe ser una imagen.',
            'imagen_portada.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg.',
            'imagen_portada.max' => 'La imagen no debe ser mayor a 10MB.',
            'maximo_areas.required' => 'El máximo de áreas es obligatorio.',
            'maximo_areas.integer' => 'El máximo de áreas debe ser un número entero.',
            'maximo_areas.min' => 'El máximo de áreas debe ser al menos 0.',
            'condiciones' => 'Las condiciones son opcionales.',
        ];
    }

    /**
     * Método que se ejecuta después de que falla la validación
     * para registrar los errores en el log
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        \Illuminate\Support\Facades\Log::error('StoreOlimpiadaRequest: Validación fallida', [
            'errores' => $validator->errors()->toArray(),
            'datos_enviados' => $this->all()
        ]);

        throw new \Illuminate\Validation\ValidationException($validator, response()->json([
            'success' => false,
            'message' => 'Error de validación',
            'errors' => $validator->errors()
        ], 422));
    }

    /**
     * Después de la validación, verificamos las áreas de condiciones
     */
    public function after(): array
    {
        return [
            function ($validator) {
                \Illuminate\Support\Facades\Log::info('StoreOlimpiadaRequest: Ejecutando validación after');

                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                // Verificamos si hay un área en condiciones que no esté en las áreas seleccionadas
                if ($this->has('condiciones') && is_array($this->input('condiciones')) && $this->has('areas')) {
                    $areas = $this->input('areas');
                    foreach ($this->input('condiciones') as $index => $condicion) {
                        if (isset($condicion['area_id']) && !in_array($condicion['area_id'], $areas)) {
                            \Illuminate\Support\Facades\Log::error('StoreOlimpiadaRequest: Área en condición no está en áreas seleccionadas', [
                                'condicion_area_id' => $condicion['area_id'],
                                'areas_seleccionadas' => $areas
                            ]);
                            $validator->errors()->add(
                                "condiciones.{$index}.area_id",
                                "El área de la condición debe estar incluida en las áreas seleccionadas (área {$condicion['area_id']} no encontrada)"
                            );
                        }
                    }
                }
            }
        ];
    }
}
