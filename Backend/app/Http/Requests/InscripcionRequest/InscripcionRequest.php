<?php
namespace App\Http\Requests\InscripcionRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class InscripcionRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'olimpiada_id' => 'required|exists:olimpiadas,id',
            'areas' => 'required|array|min:1',
            'areas.*' => 'required|integer|exists:area,id',
            'niveles' => 'required|array|min:1',
            'niveles.*' => 'required|integer|exists:category_level,id',
            // Datos del estudiante/competidor - todos obligatorios
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'documento_identidad' => 'required|string|max:20',
            'correo_electronico' => 'required|email|max:100',
            'fecha_nacimiento' => 'required|date',
            'colegio' => 'required|string|max:100',
            'provincia' => 'required|string|max:100',
            'curso' => 'required|string|max:50',
            // Tutores - todos obligatorios
            'tutores' => 'required|array|min:1',
            'tutores.*.nombres' => 'required|string|max:100',
            'tutores.*.apellidos' => 'required|string|max:100',
            'tutores.*.correo_electronico' => 'required|email|max:100',
            'tutores.*.telefono' => 'required|string|max:20',
            'tutores.*.es_principal' => 'required|boolean',
            'tutores.*.relacion' => 'required|string|max:50',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'olimpiada_id.required' => 'Debe seleccionar una olimpiada',
            'olimpiada_id.exists' => 'La olimpiada seleccionada no existe',
            'areas.required' => 'Debe seleccionar al menos un área',
            'areas.min' => 'Debe seleccionar al menos un área',
            'areas.*.required' => 'Todos los IDs de áreas son obligatorios',
            'niveles.required' => 'Debe seleccionar al menos un nivel',
            'niveles.min' => 'Debe seleccionar al menos un nivel',
            'niveles.*.required' => 'Todos los IDs de niveles son obligatorios',

            // Mensajes para datos de competidor
            'nombres.required' => 'El nombre del competidor es obligatorio',
            'apellidos.required' => 'El apellido del competidor es obligatorio',
            'documento_identidad.required' => 'El documento de identidad es obligatorio',
            'correo_electronico.required' => 'El correo electrónico del competidor es obligatorio',
            'correo_electronico.email' => 'El correo electrónico del competidor debe tener un formato válido',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria',
            'fecha_nacimiento.date' => 'La fecha de nacimiento debe tener un formato válido',
            'colegio.required' => 'El colegio es obligatorio',
            'provincia.required' => 'La provincia es obligatoria',
            'curso.required' => 'El curso es obligatorio',

            // Mensajes para tutores
            'tutores.required' => 'Debe registrar al menos un tutor para el competidor',
            'tutores.min' => 'Debe registrar al menos un tutor para el competidor',
            'tutores.*.nombres.required' => 'El nombre del tutor es obligatorio',
            'tutores.*.apellidos.required' => 'El apellido del tutor es obligatorio',
            'tutores.*.correo_electronico.required' => 'El correo electrónico del tutor es obligatorio',
            'tutores.*.correo_electronico.email' => 'El correo electrónico del tutor no tiene un formato válido',
            'tutores.*.telefono.required' => 'El teléfono del tutor es obligatorio',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            'message' => 'Error de validación',
            'errors' => $validator->errors()
        ], 422));
    }

    public function formatData()
    {
        $datos = $this->validated();

        $competidor = [
            'nombres' => $datos['nombres'],
            'apellidos' => $datos['apellidos'],
            'documento_identidad' => $datos['documento_identidad'],
            'correo_electronico' => $datos['correo_electronico'],
            'fecha_nacimiento' => $datos['fecha_nacimiento'],
            'provincia' => $datos['provincia'],
            'curso' => $datos['curso'],
            'colegio' => $datos['colegio'],
            'tutores' => []
        ];

        if (isset($datos['tutores']) && is_array($datos['tutores'])) {
            foreach ($datos['tutores'] as $index => $tutor) {
                $competidor['tutores'][] = [
                    'nombres' => $tutor['nombres'],
                    'apellidos' => $tutor['apellidos'],
                    'correo_electronico' => $tutor['correo_electronico'],
                    'telefono' => $tutor['telefono'],
                    'es_principal' => $index === 0,
                ];
            }
        }

        $areas = $datos['areas'];
        if (isset($areas[0]) && is_array($areas[0]) && isset($areas[0]['id'])) {
            $areas = array_map(function($area) {
                return $area['id'];
            }, $areas);
        }

        $niveles = $datos['niveles'];
        if (isset($niveles[0]) && is_array($niveles[0]) && isset($niveles[0]['id'])) {
            $niveles = array_map(function($nivel) {
                return $nivel['id'];
            }, $niveles);
        }

        return [
            'proceso' => $this->proceso,
            'olimpiada_id' => $datos['olimpiada_id'],
            'areas' => $areas,
            'niveles' => $niveles,
            'competidores' => [$competidor]
        ];
    }

    /**
     * Agregar el proceso al array de datos validados
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        $validated['proceso'] = $this->proceso;
        return $validated;
    }
}
