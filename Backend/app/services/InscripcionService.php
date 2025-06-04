<?php

namespace App\Services;

use App\Models\Area;
use App\Models\Boleta;
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
        \App\Services\Helpers\InscripcionHelper::verificarProcesoActivo($proceso, 'registrar competidores');

        if ($proceso->status !== EstadoInscripcion::PENDIENTE) {
            throw new Exception('El proceso de inscripción no está en estado pendiente');
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
        \App\Services\Helpers\InscripcionHelper::verificarProcesoActivo($proceso, 'registrar tutores');

        if ($proceso->status !== EstadoInscripcion::PENDIENTE) {
            throw new Exception('El proceso de inscripción no está en estado pendiente');
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

    public function guardarSeleccionArea(RegistrationProcess $proceso, $areaIds)
    {
        // Verificar si el proceso está activo
        \App\Services\Helpers\InscripcionHelper::verificarProcesoActivo($proceso, 'seleccionar áreas');

        // Convertir el parámetro a arreglo si no lo es
        if (!is_array($areaIds)) {
            $areaIds = [$areaIds];
        }


        $areasSeleccionadas = $this->procesoRepository->obtenerAreasSeleccionadas($proceso->id);


        $maximoAreas = $proceso->olimpiada->maximo_areas;

        // Verificar que no exceda el máximo de áreas permitidas
        $nuevasAreas = array_diff($areaIds, $areasSeleccionadas);
        if (count($areasSeleccionadas) + count($nuevasAreas) > $maximoAreas) {
            throw new Exception("No puede seleccionar más de {$maximoAreas} área(s) para esta olimpiada. Ya ha seleccionado " . count($areasSeleccionadas) . " área(s).");
        }

        // Verificar para cada área nueva si es válida y si cumple con las condiciones
        foreach ($areaIds as $areaId) {

            $areaValidaEnConditions = $proceso->olimpiada->conditions()
                ->where('area_id', $areaId)
                ->exists();

            if (!$areaValidaEnConditions) {
                throw new Exception("El área con ID {$areaId} no es válida para esta olimpiada");
            }


            $condition = $proceso->olimpiada->getAreaConditions($areaId);

            // Si el área que se está intentando agregar es exclusiva
            if ($condition && $condition->area_exclusiva) {
                if (!empty($areasSeleccionadas) && !in_array($areaId, $areasSeleccionadas)) {
                    throw new Exception("El área con ID {$areaId} es exclusiva y no puede combinarse con otras áreas.");
                }

                if (count($areaIds) > 1) {
                    throw new Exception("El área con ID {$areaId} es exclusiva y no puede combinarse con otras áreas.");
                }
            }

            // Verificar si alguna de las áreas ya seleccionadas es exclusiva
            if (!empty($areasSeleccionadas) && !in_array($areaId, $areasSeleccionadas)) {
                foreach ($areasSeleccionadas as $selectedAreaId) {
                    $areaCondition = $proceso->olimpiada->getAreaConditions($selectedAreaId);
                    if ($areaCondition && $areaCondition->area_exclusiva) {
                        throw new Exception("Ya ha seleccionado un área exclusiva (ID: {$selectedAreaId}) que no permite combinaciones con otras áreas.");
                    }
                }
            }
        }


        $guardadas = true;
        foreach ($areaIds as $areaId) {
            if (!in_array($areaId, $areasSeleccionadas)) {
                $guardadas = $guardadas && $this->procesoRepository->guardarSeleccionArea($proceso->id, $areaId);
            }
        }

        return $guardadas;
    }

    public function guardarSeleccionNivel(RegistrationProcess $proceso, $nivelIds)
    {
        \App\Services\Helpers\InscripcionHelper::verificarProcesoActivo($proceso, 'seleccionar niveles');

        if (!is_array($nivelIds)) {
            $nivelIds = [$nivelIds];
        }

        $areasSeleccionadas = $this->procesoRepository->obtenerAreasSeleccionadas($proceso->id);

        if (empty($areasSeleccionadas)) {
            throw new Exception('Debe seleccionar al menos un área antes de seleccionar un nivel');
        }

        $nivelesSeleccionados = $this->procesoRepository->obtenerNivelesSeleccionados($proceso->id);

        $nivelesAreasCompatibles = [];

        foreach ($nivelIds as $nivelId) {
            $areasCompatibles = [];

            foreach ($areasSeleccionadas as $areaId) {
                try {
                    $this->categoryLevelService->getCategoryByIdAndAreaId($nivelId, $areaId);
                    $areasCompatibles[] = $areaId;
                } catch (Exception $e) {
                    continue;
                }
            }

            if (empty($areasCompatibles)) {
                throw new Exception("El nivel con ID {$nivelId} no es válido para ninguna de las áreas seleccionadas");
            }

            $nivelesAreasCompatibles[$nivelId] = $areasCompatibles;
        }

        $nivelesAsignadosPorArea = [];

        foreach ($nivelesSeleccionados as $nivelId) {
            foreach ($areasSeleccionadas as $areaId) {
                try {
                    $this->categoryLevelService->getCategoryByIdAndAreaId($nivelId, $areaId);
                    if (!isset($nivelesAsignadosPorArea[$areaId])) {
                        $nivelesAsignadosPorArea[$areaId] = [];
                    }
                    $nivelesAsignadosPorArea[$areaId][] = $nivelId;
                } catch (Exception $e) {
                    continue;
                }
            }
        }

        foreach ($nivelIds as $nivelId) {
            if (in_array($nivelId, $nivelesSeleccionados)) {
                continue;
            }

            foreach ($nivelesAreasCompatibles[$nivelId] as $areaId) {
                $condition = $proceso->olimpiada->getAreaConditions($areaId);

                if ($condition && $condition->nivel_unico) {
                    if (isset($nivelesAsignadosPorArea[$areaId]) && !empty($nivelesAsignadosPorArea[$areaId])) {
                        throw new Exception("El área con ID {$areaId} permite seleccionar un único nivel por competidor.");
                    }
                }

                if (!isset($nivelesAsignadosPorArea[$areaId])) {
                    $nivelesAsignadosPorArea[$areaId] = [];
                }
                $nivelesAsignadosPorArea[$areaId][] = $nivelId;
            }
        }

        $guardadas = true;
        foreach ($nivelIds as $nivelId) {
            if (!in_array($nivelId, $nivelesSeleccionados)) {
                $guardadas = $guardadas && $this->procesoRepository->guardarSeleccionNivel($proceso->id, $nivelId);
            }
        }

        return $guardadas;
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

        $areasSeleccionadas = $this->procesoRepository->obtenerAreasSeleccionadas($proceso->id);
        $nivelesSeleccionados = $this->procesoRepository->obtenerNivelesSeleccionados($proceso->id);

        if (!empty($areasSeleccionadas) && !empty($nivelesSeleccionados)) {
            try {
                $areas = Area::whereIn('id', $areasSeleccionadas)->get();
                $niveles = CategoryLevel::whereIn('id', $nivelesSeleccionados)->get();

                $areasData = $areas->map(function ($area) {
                    return [
                        'id' => $area->id,
                        'nombre' => $area->nombre,
                        'descripcion' => $area->descripcion
                    ];
                })->toArray();

                $nivelesData = $niveles->map(function ($nivel) {
                    return [
                        'id' => $nivel->id,
                        'nombre' => $nivel->name,  // Cambio: usando 'name' en lugar de 'nombre' para consistencia
                        'descripcion' => $nivel->descripcion
                    ];
                })->toArray();

                $resumen['seleccion'] = [
                    'areas' => $areasData,
                    'niveles' => $nivelesData
                ];

                // Desglose detallado de costos por combinación área-nivel
                $costoTotal = 0;
                $cantidadCompetidores = count($competidores);
                $desglosePorCombinacion = [];

                foreach ($areas as $area) {
                    foreach ($niveles as $nivel) {
                        try {

                            $this->categoryLevelService->getCategoryByIdAndAreaId($nivel->id, $area->id);

                            $costo = Cost::where('area_id', $area->id)
                                ->where('category_id', $nivel->id)
                                ->first();

                            if ($costo && isset($costo->price)) {
                                $costoUnitario = $costo->price;
                                $costoTotalCombinacion = $costoUnitario * $cantidadCompetidores;

                                $desglosePorCombinacion[] = [
                                    'area' => [
                                        'id' => $area->id,
                                        'nombre' => $area->nombre
                                    ],
                                    'nivel' => [
                                        'id' => $nivel->id,
                                        'nombre' => $nivel->name
                                    ],
                                    'costo_unitario' => $costoUnitario,
                                    'costo_unitario_formateado' => number_format($costoUnitario, 2),
                                    'subtotal' => $costoTotalCombinacion,
                                    'subtotal_formateado' => number_format($costoTotalCombinacion, 2)
                                ];

                                $costoTotal += $costoTotalCombinacion;
                            }
                        } catch (Exception $e) {
                            continue;
                        }
                    }
                }

                $resumen['costo'] = [
                    'cantidad_competidores' => $cantidadCompetidores,
                    'monto_total' => $costoTotal,
                    'monto_total_formateado' => number_format($costoTotal, 2),
                    'desglose_combinaciones' => $desglosePorCombinacion
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
        try {
            $proceso = RegistrationProcess::with([
                'olimpiada',
                'user',
                'detalles.competidor',
                'detalles.area',
                'detalles.nivel_categoria',
                'boleta'
            ])->findOrFail($procesoId);

            return $proceso;
        } catch (ModelNotFoundException $e) {
            throw new Exception("El proceso de inscripción con ID {$procesoId} no existe");
        }
    }

    public function obtenerEstadoProceso($procesoId)
    {
        $estado = $this->procesoRepository->obtenerEstadoProceso($procesoId);
        if ($estado == EstadoInscripcion::PENDIENTE) {
            return 'Pendiente';
        } elseif ($estado == EstadoInscripcion::INSCRITO) {
            return 'Aceptado';
        } elseif ($estado == EstadoInscripcion::RECHAZADO) {
            return 'Rechazado';
        }
    }

    public function obtenerProcesoPorOlimpiada($olimpiadaId)
    {
        return 0;
    }

    public function actualizarEstadoProcesoTemporalmente(RegistrationProcess $proceso, EstadoInscripcion $nuevoEstado)
    {
        try {

            $this->procesoRepository->actualizarEstadoActivacion($proceso->id, true);

            $proceso->status = $nuevoEstado->value;
            $resultado = $proceso->save();

            if (!$resultado) {
                throw new Exception('No se pudo actualizar el estado del proceso de inscripción');
            }

            $this->procesoRepository->actualizarEstadoActivacion($proceso->id, false);

            return true;
        } catch (Exception $e) {
            $this->procesoRepository->actualizarEstadoActivacion($proceso->id, false);
            throw $e;
        }
    }

    public function validarCambioEstado(EstadoInscripcion $estadoActual, EstadoInscripcion $nuevoEstado)
    {
        $transicionesPermitidas = [
            EstadoInscripcion::PENDIENTE->value => [
                EstadoInscripcion::INSCRITO->value,
                EstadoInscripcion::RECHAZADO->value
            ],
        ];

        // Si no hay transiciones definidas para el estado actual o el nuevo estado no está en la lista de permitidos
        if (!isset($transicionesPermitidas[$estadoActual->value]) ||
            !in_array($nuevoEstado->value, $transicionesPermitidas[$estadoActual->value])) {
            throw new Exception("No se permite cambiar del estado '{$estadoActual->label()}' al estado '{$nuevoEstado->label()}'");
        }
        return true;
    }

    public function verificarYRepararProcesosActivos(int $olimpiadaId, int $userId)
    {
        // Buscar procesos existentes para esta olimpiada y usuario
        $procesos = RegistrationProcess::where('olimpiada_id', $olimpiadaId)
            ->where('user_id', $userId)
            ->get();

        if ($procesos->isEmpty()) {
            return null;
        }

        // Verificar si hay algún proceso activo sin boleta generada
        foreach ($procesos as $proceso) {
            $tieneBoleta = Boleta::where('registration_process_id', $proceso->id)->exists();

            // Si no tiene boleta y está inactivo, lo reparamos
            if (!$tieneBoleta && !$proceso->active) {
                $proceso->active = true;
                $proceso->save();
                \Illuminate\Support\Facades\Log::info("Proceso {$proceso->id} reparado: Estado de activación cambiado a ACTIVO");
                return $proceso;
            }

            // Si ya hay un proceso activo sin boleta, lo devolvemos
            if ($proceso->active && !$tieneBoleta) {
                return $proceso;
            }
        }

        return null;
    }

    public function obtenerProcesosCerradosUsuario(int $userId): array
    {
        $procesos = RegistrationProcess::with([
            'olimpiada:id,nombre',
            'detalles.area:id,nombre',
            'detalles.nivel_categoria:id,name',
            'detalles.competidor:id,nombres,apellidos,documento_identidad,colegio',
            'detalles.competidor.tutores:id,nombres,apellidos,telefono,correo_electronico',
            'boleta:id,registration_process_id,numero_boleta,monto_total,estado,fecha_emision'
        ])
        ->where('user_id', $userId)
        ->where('active', false)
        ->orderBy('created_at', 'desc')
        ->get();

        return $procesos->map(function ($proceso) {
            // Agrupar detalles por área
            $areas = $proceso->detalles->groupBy('area_id')->map(function($detallesArea, $areaId) {
                $primerDetalle = $detallesArea->first();
                return [
                    'id' => $areaId,
                    'nombre' => $primerDetalle->area->nombre,
                    'niveles' => $detallesArea->pluck('nivel_categoria.name', 'nivel_categoria.id')->toArray()
                ];
            })->values();

            $competidores = $proceso->detalles->pluck('competidor')->unique('id')->values();

            $tutores = $competidores->flatMap(function($competidor) {
                return $competidor->tutores;
            })->unique('id')->values();

            // Calcular monto total
            $montoTotal = $proceso->boleta ? $proceso->boleta->monto_total :
                        $proceso->detalles->sum('monto');

            return [
                'id' => $proceso->id,
                'tipo' => $proceso->type,
                'fecha' => $proceso->created_at->format('d/m/Y'),
                'estado' => $proceso->status->value,
                'estado_label' => $proceso->status->label(),
                'olimpiada' => [
                    'id' => $proceso->olimpiada->id,
                    'nombre' => $proceso->olimpiada->nombre
                ],
                'areas' => $areas->pluck('nombre')->join(', '),
                'areas_detalle' => $areas,
                'competidores' => $competidores->map(function($competidor) {
                    return [
                        'id' => $competidor->id,
                        'nombre_completo' => $competidor->nombres . ' ' . $competidor->apellidos,
                        'ci' => $competidor->documento_identidad,
                        'colegio' => $competidor->colegio
                    ];
                }),
                'tutores' => $tutores->map(function($tutor) {
                    return [
                        'id' => $tutor->id,
                        'nombre_completo' => $tutor->nombres . ' ' . $tutor->apellidos,
                        'email' => $tutor->correo_electronico,
                        'telefono' => $tutor->telefono
                    ];
                }),
                'monto' => $montoTotal,
                'boleta' => $proceso->boleta ? [
                    'id' => $proceso->boleta->id,
                    'numero' => $proceso->boleta->numero_boleta,
                    'estado' => $proceso->boleta->estado
                ] : null,
                'cantidad_estudiantes' => $competidores->count(),
                'tiene_boleta' => (bool) $proceso->boleta
            ];
        })->toArray();
    }

    public function obtenerProcesoCerradoPorId(int $procesoId, int $userId): array|null
    {
        $proceso = RegistrationProcess::with([
            'olimpiada:id,nombre',
            'detalles.area:id,nombre',
            'detalles.nivel_categoria:id,name',
            'detalles.competidor:id,nombres,apellidos,documento_identidad,colegio',
            'detalles.competidor.tutores:id,nombres,apellidos,telefono,correo_electronico',
            'boleta:id,registration_process_id,numero_boleta,monto_total,estado,fecha_emision'
        ])
        ->where('user_id', $userId)
        ->where('id', $procesoId)
        ->where('active', false)
        ->first();

        if (!$proceso) {
            return null;
        }

        // Agrupar detalles por área
        $areas = $proceso->detalles->groupBy('area_id')->map(function($detallesArea, $areaId) {
            $primerDetalle = $detallesArea->first();
            return [
                'id' => $areaId,
                'nombre' => $primerDetalle->area->nombre,
                'niveles' => $detallesArea->pluck('nivel_categoria.name', 'nivel_categoria.id')->toArray()
            ];
        })->values();

        $competidores = $proceso->detalles->pluck('competidor')->unique('id')->values();

        $tutores = $competidores->flatMap(function($competidor) {
            return $competidor->tutores;
        })->unique('id')->values();

        // Calcular monto total
        $montoTotal = $proceso->boleta ? $proceso->boleta->monto_total :
                    $proceso->detalles->sum('monto');

        return [
            'id' => $proceso->id,
            'tipo' => $proceso->type,
            'fecha' => $proceso->created_at->format('d/m/Y'),
            'estado' => $proceso->status->value,
            'estado_label' => $proceso->status->label(),
            'olimpiada' => [
                'id' => $proceso->olimpiada->id,
                'nombre' => $proceso->olimpiada->nombre
            ],
            'areas' => $areas->pluck('nombre')->join(', '),
            'areas_detalle' => $areas,
            'competidores' => $competidores->map(function($competidor) {
                return [
                    'id' => $competidor->id,
                    'nombre_completo' => $competidor->nombres . ' ' . $competidor->apellidos,
                    'ci' => $competidor->documento_identidad,
                    'colegio' => $competidor->colegio
                ];
            }),
            'tutores' => $tutores->map(function($tutor) {
                return [
                    'id' => $tutor->id,
                    'nombre_completo' => $tutor->nombres . ' ' . $tutor->apellidos,
                    'email' => $tutor->correo_electronico,
                    'telefono' => $tutor->telefono
                ];
            }),
            'monto' => $montoTotal,
            'boleta' => $proceso->boleta ? [
                'id' => $proceso->boleta->id,
                'numero' => $proceso->boleta->numero_boleta,
                'estado' => $proceso->boleta->estado
            ] : null,
            'cantidad_estudiantes' => $competidores->count(),
            'tiene_boleta' => (bool) $proceso->boleta
        ];
    }
}
