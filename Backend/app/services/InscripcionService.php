<?php

namespace App\Services;

use App\Models\Area;
use App\Models\CategoryLevel;
use App\Models\CompetidorTutor;
use App\Models\Competitor;
use App\Models\Cost;
use App\Models\Olimpiada;
use App\Models\RegistrationProcess;
use App\Models\Tutor;
use App\Repositories\ProcesoInscripcionRepository;
use App\Enums\EstadoInscripcion;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class InscripcionService
{
    protected $categoryLevelService;
    protected $procesoRepository;

    public function __construct(ProcesoInscripcionRepository $procesoRepository, CategoryLevelService $categoryLevelService)
    {
        $this->categoryLevelService = $categoryLevelService;
        $this->procesoRepository = $procesoRepository;
    }

    public function iniciarProceso(Olimpiada $olimpiada, string $tipo, int $usuarioId)
    {
        if (!$olimpiada->activo || $olimpiada->fecha_fin < now()) {
            throw new Exception('La olimpiada no está disponible para inscripciones');
        }

        if (!in_array($tipo, ['individual', 'grupal'])) {
            throw new Exception('El tipo de inscripción no es válido');
        }

        return $this->procesoRepository->crear([
            'olimpiada_id' => $olimpiada->id,
            'user_id' => $usuarioId,
            'start_date' => now(),
            'type' => $tipo,
            'status' => EstadoInscripcion::PENDIENTE->value,
            'active' => true
        ]);
    }

    public function registrarCompetidor(RegistrationProcess $proceso, array $datos)
    {
        if (!$proceso->active || $proceso->status !== EstadoInscripcion::PENDIENTE) {
            throw new Exception('El proceso de inscripción no está activo');
        }

        $cursoNivel = explode(' ', $datos['curso']);
        $datos['curso'] = $cursoNivel[0];
        $datos['nivel'] = $cursoNivel[1];

        $competidor = Competitor::create($datos);
        $this->procesoRepository->agregarCompetidor($proceso->id, $competidor->id);

        return $competidor;
    }

    public function registrarTutor(RegistrationProcess $proceso, array $datos, array $competidoresIds, int $usuarioId)
    {
        if (!$proceso->active || $proceso->status !== EstadoInscripcion::PENDIENTE) {
            throw new Exception('El proceso de inscripción no está activo');
        }

        if (empty($competidoresIds)) {
            throw new Exception('Debe seleccionar al menos un competidor');
        }

        $tutor = Tutor::updateOrCreate(
            ['correo_electronico' => $datos['correo_electronico']],
            [
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'telefono' => $datos['telefono'],
            ]
        );

        foreach ($competidoresIds as $competidorId) {
            try {
                if (!$this->procesoRepository->competidorPerteneceAProceso($proceso->id, $competidorId)) {
                    throw new Exception("El competidor no pertenece a este proceso de inscripción");
                }

                CompetidorTutor::create([
                    'competidor_id' => $competidorId,
                    'tutor_id' => $tutor->id,
                    'es_principal' => $datos['es_principal'] ?? false,
                    'relacion' => $datos['relacion'] ?? 'Tutor',
                    'activo' => true
                ]);
            } catch (ModelNotFoundException $e) {
                throw new Exception("Uno de los competidores seleccionados no existe");
            }
        }

        return $tutor;
    }

    public function guardarSeleccionArea(RegistrationProcess $proceso, int $areaId)
    {
        $areaValida = $proceso->olimpiada->areas()
            ->where('area.id', $areaId)
            ->where('olimpiada_area.activo', true)
            ->exists();

        if (!$areaValida) {
            throw new Exception('El área seleccionada no es válida para esta olimpiada');
        }

        // Obtener las áreas ya seleccionadas
        $areasSeleccionadas = $this->procesoRepository->obtenerAreasSeleccionadas($proceso->id);

        $maximoAreas = $proceso->olimpiada->maximo_areas;
        if (count($areasSeleccionadas) >= $maximoAreas && !in_array($areaId, $areasSeleccionadas)) {
            throw new Exception("No puede seleccionar más de {$maximoAreas} área(s) para esta olimpiada. Ya ha seleccionado " . count($areasSeleccionadas) . " área(s).");
        }

        // Validación para área_exclusiva
        $condition = $proceso->olimpiada->getAreaConditions($areaId);
        if ($condition && $condition->area_exclusiva) {
            if (!empty($areasSeleccionadas) && !in_array($areaId, $areasSeleccionadas)) {
                throw new Exception("El área seleccionada es exclusiva y no puede combinarse con otras áreas.");
            }
        }

        // Verificar si alguna de las áreas ya seleccionadas es exclusiva
        if (!empty($areasSeleccionadas) && !in_array($areaId, $areasSeleccionadas)) {
            foreach ($areasSeleccionadas as $selectedAreaId) {
                $areaCondition = $proceso->olimpiada->getAreaConditions($selectedAreaId);
                if ($areaCondition && $areaCondition->area_exclusiva) {
                    throw new Exception("Ya ha seleccionado un área exclusiva que no permite combinaciones con otras áreas.");
                }
            }
        }

        $this->procesoRepository->guardarSeleccionArea($proceso->id, $areaId);
        return true;
    }

    public function guardarSeleccionNivel(RegistrationProcess $proceso, int $nivelId)
    {
        $areaId = $this->procesoRepository->obtenerAreaSeleccionada($proceso->id);

        if (!$areaId) {
            throw new Exception('Debe seleccionar un área antes de seleccionar un nivel');
        }

        try {
            $this->categoryLevelService->getCategoryByIdAndAreaId($nivelId, $areaId);
        } catch (Exception $e) {
            throw new Exception('El nivel seleccionado no es válido para esta área');
        }

        // Validación para nivel_unico
        $condition = $proceso->olimpiada->getAreaConditions($areaId);
        if ($condition && $condition->nivel_unico) {
            $nivelSeleccionado = $this->procesoRepository->obtenerNivelSeleccionado($proceso->id);

            if ($nivelSeleccionado && $nivelSeleccionado != $nivelId) {
                throw new Exception('Esta área permite seleccionar un único nivel por competidor.');
            }
        }

        $this->procesoRepository->guardarSeleccionNivel($proceso->id, $nivelId);
        return true;
    }

    public function generarResumen(RegistrationProcess $proceso)
    {
        $resumen = [
            'proceso_id' => $proceso->id,
            'olimpiada' => [
                'id' => $proceso->olimpiada->id,
                'nombre' => $proceso->olimpiada->nombre,
                'descripcion' => $proceso->olimpiada->descripcion
            ],
            'tipo_inscripcion' => $proceso->type,
            'fecha_inicio' => $proceso->start_date->format('Y-m-d H:i:s'),
            'estado' => $proceso->status
        ];

        $competidores = $this->procesoRepository->obtenerCompetidores($proceso->id);
        $resumen['competidores'] = [];

        foreach ($competidores as $competidor) {
            $datosCompetidor = [
                'id' => $competidor->id,
                'nombres' => $competidor->nombres,
                'apellidos' => $competidor->apellidos,
                'documento_identidad' => $competidor->documento_identidad,
                'correo_electronico' => $competidor->correo_electronico
            ];

            $tutores = $competidor->tutores;
            $datosCompetidor['tutores'] = [];

            foreach ($tutores as $tutor) {
                $datosCompetidor['tutores'][] = [
                    'id' => $tutor->id,
                    'nombres' => $tutor->nombres,
                    'apellidos' => $tutor->apellidos,
                    'correo_electronico' => $tutor->correo_electronico,
                    'telefono' => $tutor->telefono,
                    'es_principal' => $tutor->pivot->es_principal,
                    'relacion' => $tutor->pivot->relacion
                ];
            }

            $resumen['competidores'][] = $datosCompetidor;
        }

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

    private function calcularCosto($areaId, $nivelId, $cantidadCompetidores)
    {
        $costo = Cost::where('area_id', $areaId)
            ->where('category_id', $nivelId)
            ->first();

        $costoUnitario = $costo ? $costo->price : 0;

        return [
            'unitario' => $costoUnitario,
            'total' => $costoUnitario * $cantidadCompetidores
        ];
    }

    public function obtenerProcesoPorId($procesoId)
    {
        return 0;
    }

    public function obtenerProcesoPorOlimpiada($olimpiadaId)
    {
        return 0;
    }
}
