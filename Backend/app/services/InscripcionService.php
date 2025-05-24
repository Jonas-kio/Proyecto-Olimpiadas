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

        // Si todas las validaciones pasan, guardar todas las áreas
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
        // Verificar si el proceso está activo
        \App\Services\Helpers\InscripcionHelper::verificarProcesoActivo($proceso, 'seleccionar niveles');

        if (!is_array($nivelIds)) {
            $nivelIds = [$nivelIds];
        }

        $areasSeleccionadas = $this->procesoRepository->obtenerAreasSeleccionadas($proceso->id);

        if (empty($areasSeleccionadas)) {
            throw new Exception('Debe seleccionar al menos un área antes de seleccionar un nivel');
        }

        // Obtener niveles ya seleccionados
        $nivelesSeleccionados = $this->procesoRepository->obtenerNivelesSeleccionados($proceso->id);

        // Mapear cada nivel a qué áreas es compatible
        $nivelesAreasCompatibles = [];

        // Para cada nuevo nivel, encontrar con qué áreas es compatible
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

        // Verificar restricciones de nivel_unico por área
        $nivelesAsignadosPorArea = [];

        // Primero considerar los niveles que ya están seleccionados
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

        // Luego verificar los nuevos niveles
        foreach ($nivelIds as $nivelId) {
            if (in_array($nivelId, $nivelesSeleccionados)) {
                continue; // Ignorar niveles que ya están seleccionados
            }

            foreach ($nivelesAreasCompatibles[$nivelId] as $areaId) {
                $condition = $proceso->olimpiada->getAreaConditions($areaId);

                if ($condition && $condition->nivel_unico) {
                    // Si esta área ya tiene un nivel asignado (tanto previamente seleccionado como en esta ejecución)
                    if (isset($nivelesAsignadosPorArea[$areaId]) && !empty($nivelesAsignadosPorArea[$areaId])) {
                        throw new Exception("El área con ID {$areaId} permite seleccionar un único nivel por competidor.");
                    }
                }

                // Registrar este nivel como asignado para esta área
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
                        'nombre' => $nivel->nombre,
                        'descripcion' => $nivel->descripcion
                    ];
                })->toArray();

                $resumen['seleccion'] = [
                    'areas' => $areasData,
                    'niveles' => $nivelesData
                ];

                // Para el costo, sumamos el costo de cada combinación área-nivel
                $costoTotal = 0;
                $costoUnitario = 0;

                foreach ($areasSeleccionadas as $areaId) {
                    foreach ($nivelesSeleccionados as $nivelId) {
                        try {
                            // Verificar si esta combinación área-nivel es válida
                            $this->categoryLevelService->getCategoryByIdAndAreaId($nivelId, $areaId);

                            // Si es válida, añadir el costo
                            $costoPorArea = $this->calcularCosto($areaId, $nivelId, count($competidores));
                            $costoUnitario += $costoPorArea['unitario'];
                            $costoTotal += $costoPorArea['total'];
                        } catch (Exception $e) {
                            // Si no es válida, ignorar esta combinación
                            continue;
                        }
                    }
                }

                $resumen['costo'] = [
                    'monto_unitario' => $costoUnitario,
                    'cantidad_competidores' => count($competidores),
                    'monto_total' => $costoTotal
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

            $proceso->status = $nuevoEstado;
            $resultado = $proceso->save();

            if (!$resultado) {
                throw new Exception('No se pudo actualizar el estado del proceso de inscripción');
            }

            $this->procesoRepository->actualizarEstadoActivacion($proceso->id, false);

            return true;
        } catch (Exception $e) {
            // Si hay algún error, nos aseguramos de que el proceso quede desactivado
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
}
