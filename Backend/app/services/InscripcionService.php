<?php

namespace App\Services;

use App\Models\Area;
use App\Models\CategoryLevel;
use App\Models\Competidor;
use App\Models\CompetidorTutor;
use App\Models\Competitor;
use App\Models\Cost;
use App\Models\Costo;
use App\Models\NivelCategoria;
use App\Models\Olimpiada;
use App\Models\ProcesoInscripcion;
use App\Models\Tutor;
use App\Repositories\ProcesoInscripcionRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use App\Models\Costs;

class InscripcionService
{
    protected $procesoRepository;

    public function __construct(ProcesoInscripcionRepository $procesoRepository)
    {
        $this->procesoRepository = $procesoRepository;
    }

    /**
     * Inicia un nuevo proceso de inscripción
     */
    public function iniciarProceso(Olimpiada $olimpiada, string $tipo, int $usuarioId)
    {
        // Validar que la olimpiada esté activa y en fechas válidas
        if (!$olimpiada->activo || $olimpiada->fecha_fin < now()) {
            throw new \Exception('La olimpiada no está disponible para inscripciones');
        }

        // Validar el tipo de inscripción
        if (!in_array($tipo, ['individual', 'grupal'])) {
            throw new \Exception('El tipo de inscripción no es válido');
        }

        // Crear el proceso de inscripción
        return $this->procesoRepository->crear([
            'olimpiada_id' => $olimpiada->id,
            'usuario_id' => $usuarioId,
            'fecha_inicio' => now(),
            'tipo' => $tipo,
            'estado' => 'iniciado',
            'activo' => true
        ]);
    }

    /**
     * Registra un competidor en el proceso
     */
    public function registrarCompetidor(ProcesoInscripcion $proceso, array $datos)
    {
        // Validar que el proceso esté activo
        if (!$proceso->activo || $proceso->estado !== 'iniciado') {
            throw new \Exception('El proceso de inscripción no está activo');
        }

        // Crear el competidor
        $competidor = Competitor::create($datos);

        // Guardar la relación del competidor con el proceso en la sesión
        $this->procesoRepository->agregarCompetidor($proceso->id, $competidor->id);

        return $competidor;
    }

    /**
     * Registra un tutor y lo asocia con competidores
     */
    public function registrarTutor(ProcesoInscripcion $proceso, array $datos, array $competidoresIds, int $usuarioId)
    {
        // Validar que el proceso esté activo
        if (!$proceso->activo || $proceso->estado !== 'iniciado') {
            throw new \Exception('El proceso de inscripción no está activo');
        }

        // Validar que existan competidores
        if (empty($competidoresIds)) {
            throw new \Exception('Debe seleccionar al menos un competidor');
        }

        // Crear o actualizar el tutor
        $tutor = Tutor::updateOrCreate(
            ['correo' => $datos['correo']],
            [
                'usuario_id' => $usuarioId,
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'telefono' => $datos['telefono'],
            ]
        );

        // Asociar el tutor con los competidores
        foreach ($competidoresIds as $competidorId) {
            try {
                $competidor = Competitor::findOrFail($competidorId);

                // Verificar si el competidor pertenece al proceso actual
                if (!$this->procesoRepository->competidorPerteneceAProceso($proceso->id, $competidorId)) {
                    throw new \Exception("El competidor no pertenece a este proceso de inscripción");
                }

                // Crear la relación
                CompetidorTutor::create([
                    'competidor_id' => $competidorId,
                    'tutor_id' => $tutor->id,
                    'es_principal' => $datos['es_principal'] ?? false,
                    'relacion' => $datos['relacion'] ?? 'Tutor',
                    'activo' => true
                ]);
            } catch (ModelNotFoundException $e) {
                throw new \Exception("Uno de los competidores seleccionados no existe");
            }
        }

        return $tutor;
    }

    /**
     * Guarda la selección de área en el proceso
     */
    public function guardarSeleccionArea(ProcesoInscripcion $proceso, int $areaId)
    {
        // Validar que el área pertenezca a la olimpiada
        $areaValida = $proceso->olimpiada->areas()
            ->where('areas.id', $areaId)
            ->where('olimpiada_area.activo', true)
            ->exists();

        if (!$areaValida) {
            throw new \Exception('El área seleccionada no es válida para esta olimpiada');
        }

        // Guardar la selección en el repositorio
        $this->procesoRepository->guardarSeleccionArea($proceso->id, $areaId);

        return true;
    }

    /**
     * Guarda la selección de nivel en el proceso
     */
    public function guardarSeleccionNivel(ProcesoInscripcion $proceso, int $nivelId)
    {
        // Obtener el área seleccionada previamente
        $areaId = $this->procesoRepository->obtenerAreaSeleccionada($proceso->id);

        if (!$areaId) {
            throw new \Exception('Debe seleccionar un área antes de seleccionar un nivel');
        }

        // Validar que el nivel pertenezca al área
        $nivelValido = CategoryLevel::where('id', $nivelId)
            ->where('area_id', $areaId)
            ->where('activo', true)
            ->exists();

        if (!$nivelValido) {
            throw new \Exception('El nivel seleccionado no es válido para esta área');
        }

        // Guardar la selección en el repositorio
        $this->procesoRepository->guardarSeleccionNivel($proceso->id, $nivelId);

        return true;
    }

    /**
     * Genera un resumen del proceso de inscripción
     */
    public function generarResumen(ProcesoInscripcion $proceso)
    {
        // Obtener datos básicos del proceso
        $resumen = [
            'proceso_id' => $proceso->id,
            'olimpiada' => [
                'id' => $proceso->olimpiada->id,
                'nombre' => $proceso->olimpiada->nombre,
                'descripcion' => $proceso->olimpiada->descripcion
            ],
            'tipo_inscripcion' => $proceso->tipo,
            'fecha_inicio' => $proceso->fecha_inicio->format('Y-m-d H:i:s'),
            'estado' => $proceso->estado
        ];

        // Obtener competidores asociados al proceso
        $competidores = $this->procesoRepository->obtenerCompetidores($proceso->id);
        $resumen['competidores'] = [];

        foreach ($competidores as $competidor) {
            $datosCompetidor = [
                'id' => $competidor->id,
                'nombres' => $competidor->nombres,
                'apellidos' => $competidor->apellidos,
                'ci' => $competidor->ci,
                'colegio' => [
                    'id' => $competidor->colegio->id,
                    'nombre' => $competidor->colegio->nombre
                ],
                'tutores' => []
            ];

            // Obtener tutores de cada competidor
            foreach ($competidor->tutores as $tutor) {
                $datosCompetidor['tutores'][] = [
                    'id' => $tutor->id,
                    'nombres' => $tutor->nombres,
                    'apellidos' => $tutor->apellidos,
                    'correo' => $tutor->correo,
                    'telefono' => $tutor->telefono,
                    'es_principal' => $tutor->pivot->es_principal,
                    'relacion' => $tutor->pivot->relacion
                ];
            }

            $resumen['competidores'][] = $datosCompetidor;
        }

        // Obtener selección de área y nivel
        $areaId = $this->procesoRepository->obtenerAreaSeleccionada($proceso->id);
        $nivelId = $this->procesoRepository->obtenerNivelSeleccionado($proceso->id);

        if ($areaId && $nivelId) {
            try {
                $area = Area::findOrFail($areaId);
                $nivel = CategoryLevel::findOrFail($nivelId);

                $resumen['seleccion'] = [
                    'area' => [
                        'id' => $area->id,
                        'nombre' => $area->nombre,
                        'descripcion' => $area->descripcion
                    ],
                    'nivel' => [
                        'id' => $nivel->id,
                        'nombre' => $nivel->nombre,
                        'descripcion' => $nivel->descripcion
                    ]
                ];

                // Calcular costo total
                $costo = $this->calcularCosto($areaId, $nivelId, count($competidores));

                $resumen['costo'] = [
                    'monto_unitario' => $costo['unitario'],
                    'cantidad_competidores' => count($competidores),
                    'monto_total' => $costo['total']
                ];
            } catch (ModelNotFoundException $e) {
                $resumen['seleccion'] = null;
                $resumen['costo'] = null;
            }
        } else {
            $resumen['seleccion'] = null;
            $resumen['costo'] = null;
        }

        return $resumen;
    }

    /**
     * Calcula el costo para un área y nivel específicos
     */
    protected function calcularCosto(int $areaId, int $nivelId, int $cantidadCompetidores)
    {
        $costoItem = Cost::where('area_id', $areaId)
            ->where('nivel_categoria_id', $nivelId)
            ->where('fecha_vigencia_desde', '<=', now())
            ->where('fecha_vigencia_hasta', '>=', now())
            ->where('activo', true)
            ->first();

        if (!$costoItem) {
            throw new \Exception('No se encontró un costo vigente para esta área y nivel');
        }

        $montoUnitario = $costoItem->monto;
        $montoTotal = $montoUnitario * $cantidadCompetidores;

        return [
            'unitario' => $montoUnitario,
            'total' => $montoTotal
        ];
    }
}
