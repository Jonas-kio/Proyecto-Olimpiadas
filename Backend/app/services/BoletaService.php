<?php

namespace App\Services;

use App\Enums\BoletaEstado;
use App\Enums\EstadoInscripcion;
use App\Events\BoletaGenerada;
use App\Models\Boleta;
use App\Models\CompetidorAreaNivel;
use App\Models\CompetidorTutor;
use App\Models\Competitor;
use App\Models\Cost;
use App\Models\DetalleInscripcion;
use App\Models\Olimpiada;
use App\Models\RegistrationProcess;
use App\Models\Tutor;
use App\Models\Area;
use App\Models\CategoryLevel;
use App\Repositories\ProcesoInscripcionRepository;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Http\UploadedFile;
use League\Csv\Reader;
use League\Csv\Statement;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class BoletaService
{
    protected $procesoRepository;

    public function __construct(ProcesoInscripcionRepository $procesoRepository)
    {
        $this->procesoRepository = $procesoRepository;
    }


    public function generarBoleta(RegistrationProcess $proceso)
    {

        if ($proceso->status->value !== EstadoInscripcion::PENDIENTE->value) {
            throw new \Exception('El proceso de inscripción no está en estado válido para generar boleta');
        }

        $datosCompetidor = Cache::get("proceso_{$proceso->id}_competidor_temporal");
        $tutoresTemporales = Cache::get("proceso_{$proceso->id}_tutores_temporal", []);

        // Obtener áreas y niveles según el tipo de inscripción
        if ($proceso->type === 'grupal') {
            // Para inscripciones grupales, obtener de la tabla CompetidorAreaNivel
            $asignaciones = CompetidorAreaNivel::where('registration_process_id', $proceso->id)
                ->get();

            if ($asignaciones->isEmpty()) {
                throw new \Exception('Debe seleccionar al menos un área y un nivel para generar la boleta');
            }

            $areasIds = $asignaciones->pluck('area_id')->unique()->toArray();
            $nivelesIds = $asignaciones->pluck('category_level_id')->unique()->toArray();
        } else {
            // Para inscripciones individuales, usar el método tradicional
            $areasIds = $this->procesoRepository->obtenerAreasSeleccionadas($proceso->id);
            $nivelesIds = $this->procesoRepository->obtenerNivelesSeleccionados($proceso->id);
        }

        if (empty($areasIds) || empty($nivelesIds)) {
            throw new \Exception('Debe seleccionar al menos un área y un nivel para generar la boleta');
        }

        DB::beginTransaction();

        try {
            $competidoresIds = [];

            if ($datosCompetidor) {
                $competidor = Competitor::create($datosCompetidor);
                $competidoresIds[] = $competidor->id;

                $this->procesoRepository->agregarCompetidor($proceso->id, $competidor->id);

                if (!empty($tutoresTemporales)) {
                    foreach ($tutoresTemporales as $datosTutor) {
                        $tutor = Tutor::updateOrCreate(
                            ['correo_electronico' => $datosTutor['correo_electronico']],
                            [
                                'nombres' => $datosTutor['nombres'],
                                'apellidos' => $datosTutor['apellidos'],
                                'telefono' => $datosTutor['telefono'] ?? '',
                            ]
                        );

                        CompetidorTutor::create([
                            'competidor_id' => $competidor->id,
                            'tutor_id' => $tutor->id,
                            'es_principal' => $datosTutor['es_principal'] ?? false,
                            'relacion' => $datosTutor['relacion'] ?? 'Tutor',
                            'activo' => true
                        ]);
                    }
                }
            } else {
                // Si no hay datos temporales, verificar si hay competidores registrados
                $competidoresIds = $this->procesoRepository->obtenerIdsCompetidores($proceso->id);
                if (empty($competidoresIds)) {
                    throw new \Exception('El proceso de inscripción no tiene competidores asociados');
                }
            }

            $montoTotal = 0;
            $fechaExpiracion = $proceso->olimpiada->fecha_fin;
            if (!$fechaExpiracion) {
                throw new \Exception('La olimpiada no tiene definida una fecha de finalización');
            }

            if ($proceso->type === 'grupal') {
                // Para inscripciones grupales: calcular costo basado en asignaciones específicas
                $asignaciones = CompetidorAreaNivel::where('registration_process_id', $proceso->id)->get();

                foreach ($asignaciones as $asignacion) {
                    try {
                        $costo = Cost::where('area_id', $asignacion->area_id)
                            ->where('category_id', $asignacion->category_level_id)
                            ->firstOrFail();

                        if (!isset($costo->price)) {
                            continue;
                        }

                        DetalleInscripcion::create([
                            'register_process_id' => $proceso->id,
                            'competidor_id' => $asignacion->competitor_id,
                            'area_id' => $asignacion->area_id,
                            'categoria_id' => $asignacion->category_level_id,
                            'monto' => $costo->price,
                            'status' => true
                        ]);
                        $montoTotal += $costo->price;

                    } catch (\Exception $e) {
                        continue;
                    }
                }
            } else {
                // Para inscripciones individuales: usar la lógica original
                foreach ($areasIds as $areaId) {
                    foreach ($nivelesIds as $nivelId) {
                        try {
                            $costo = Cost::where('area_id', $areaId)
                                ->where('category_id', $nivelId)
                                ->firstOrFail();
                            if (!isset($costo->price)) {
                                continue;
                            }

                            foreach ($competidoresIds as $competidorId) {
                                DetalleInscripcion::create([
                                    'register_process_id' => $proceso->id,
                                    'competidor_id' => $competidorId,
                                    'area_id' => $areaId,
                                    'categoria_id' => $nivelId,
                                    'monto' => $costo->price,
                                    'status' => true
                                ]);
                                $montoTotal += $costo->price;
                            }
                        } catch (\Exception $e) {
                            continue;
                        }
                    }
                }
            }

            if ($montoTotal == 0) {
                throw new \Exception('No se encontraron combinaciones válidas de área y nivel para generar la boleta');
            }

            $boleta = Boleta::create([
                'registration_process_id' => $proceso->id,
                'numero_boleta' => $this->generarCodigoBoleta($proceso->type),
                'monto_total' => $montoTotal,
                'fecha_emision' => now(),
                'fecha_expiracion' => $fechaExpiracion,
                'estado' => BoletaEstado::PENDIENTE->value,
                'validado' => false
            ]);

            $this->procesoRepository->actualizarEstadoActivacion($proceso->id, false);

            Cache::forget("proceso_{$proceso->id}_competidor_temporal");
            Cache::forget("proceso_{$proceso->id}_competidor_temp_id");
            Cache::forget("proceso_{$proceso->id}_tutores_temporal");

            DB::commit();

            event(new BoletaGenerada($boleta));

            return $boleta;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error al generar la boleta: ' . $e->getMessage());
        }
    }

    public function generarCodigoBoleta($tipo)
    {
        $fechaActual = Carbon::now()->format('Ymd');

        $prefijo = 'BOL';
        if ($tipo === 'individual') {
            $prefijo = 'BOL-IND';
        } elseif ($tipo === 'grupal') {
            $prefijo = 'BOL-GRP';
        }

        $codigo = $prefijo . '-' . $fechaActual . '-' . strtoupper(Str::random(6));

        while (Boleta::where('numero_boleta', $codigo)->exists()) {
            $codigo = $prefijo . '-' . $fechaActual . '-' . strtoupper(Str::random(6));
        }

        return $codigo;
    }

    public function obtenerDatosBoleta($procesoId, $boletaId)
    {
        try {
            $boleta = Boleta::with([
                'registrationProcess',
                'registrationProcess.olimpiada',
                'registrationProcess.user',
                'registrationProcess.detalles.competidor',
                'registrationProcess.detalles.competidor.tutores',
                'registrationProcess.detalles.area',
                'registrationProcess.detalles.nivel_categoria'
            ])
            ->where('registration_process_id', $procesoId)
            ->where('id', $boletaId)
            ->firstOrFail();

            $proceso = $boleta->registrationProcess;
            if (!$proceso) {
                throw new Exception('No se encontró el proceso de inscripción');
            }

            // Datos básicos del resumen
            $resumen = [
                'proceso_id' => $proceso->id,
                'olimpiada' => [
                    'id' => $proceso->olimpiada->id,
                    'nombre' => $proceso->olimpiada->nombre,
                    'descripcion' => $proceso->olimpiada->descripcion
                ],
                'tipo_inscripcion' => $proceso->type,
                'fecha_inicio' => $proceso->start_date->format('Y-m-d H:i:s'),
                'estado' => $proceso->status->value
            ];

            // Datos de la boleta
            $resumen['boleta'] = [
                'id' => $boleta->id,
                'numero_boleta' => $boleta->numero_boleta,
                'monto_total' => $boleta->monto_total,
                'fecha_emision' => $boleta->fecha_emision ? $boleta->fecha_emision->format('Y-m-d H:i:s') : null,
                'fecha_emision_formateada' => $boleta->fecha_emision ? $boleta->fecha_emision->format('d/m/Y H:i') : null,
                'fecha_expiracion' => $boleta->fecha_expiracion ? $boleta->fecha_expiracion->format('Y-m-d H:i:s') : null,
                'fecha_expiracion_formateada' => $boleta->fecha_expiracion ? $boleta->fecha_expiracion->format('d/m/Y H:i') : null,
                'estado' => $boleta->estado->value,
                'validado' => $boleta->validado
            ];

            // Datos de competidores
            $competidores = $proceso->detalles->map(function ($detalle) {
                if (!$detalle->competidor) {
                    return null;
                }

                $datosCompetidor = [
                    'id' => $detalle->competidor->id,
                    'nombres' => $detalle->competidor->nombres,
                    'apellidos' => $detalle->competidor->apellidos,
                    'nombre_completo' => $detalle->competidor->nombres . ' ' . $detalle->competidor->apellidos,
                    'ci' => $detalle->competidor->ci ?? null,
                    'documento_identidad' => $detalle->competidor->documento_identidad,
                    'correo_electronico' => $detalle->competidor->correo_electronico,
                    'telefono' => $detalle->competidor->telefono,
                    'curso' => $detalle->competidor->curso . ' ' . $detalle->competidor->nivel,
                    'colegio' => $detalle->competidor->colegio,
                    'provincia' => $detalle->competidor->provincia,
                    'fecha_nacimiento' => $detalle->competidor->fecha_nacimiento,
                    'area' => [
                        'id' => $detalle->area->id,
                        'nombre' => $detalle->area->nombre
                    ],
                    'nivel' => [
                        'id' => $detalle->nivel_categoria->id,
                        'nombre' => $detalle->nivel_categoria->name
                    ],
                    'monto' => $detalle->monto
                ];

                // Obtener tutores (siempre incluir array, incluso si está vacío)
                $datosCompetidor['tutores'] = $detalle->competidor->tutores->map(function ($tutor) {
                    return [
                        'id' => $tutor->id,
                        'nombres' => $tutor->nombres,
                        'apellidos' => $tutor->apellidos,
                        'correo_electronico' => $tutor->correo_electronico,
                        'telefono' => $tutor->telefono,
                        'es_principal' => (bool) ($tutor->pivot->es_principal ?? false),
                        'relacion' => $tutor->pivot->relacion ?? null
                    ];
                })->toArray();

                return $datosCompetidor;
            })->filter()->values()->toArray();

            $resumen['competidores'] = $competidores;
            $cantidadCompetidores = count(array_unique(array_column($competidores, 'id')));

            // Para inscripciones grupales: calcular costos reales por asignación específica
            $costosPorCombinacion = [];
            $areasSeleccionadas = [];
            $nivelesSeleccionados = [];

            if ($proceso->type === 'grupal') {
                // Obtener asignaciones reales desde CompetidorAreaNivel
                $asignaciones = CompetidorAreaNivel::where('registration_process_id', $proceso->id)
                    ->with(['area', 'nivel'])
                    ->get();

                // Agrupar competidores por combinación área-nivel
                $competidoresPorCombinacion = [];
                foreach ($asignaciones as $asignacion) {
                    $key = $asignacion->area_id . '_' . $asignacion->category_level_id;
                    if (!isset($competidoresPorCombinacion[$key])) {
                        $competidoresPorCombinacion[$key] = [
                            'area' => $asignacion->area,
                            'nivel' => $asignacion->nivel,
                            'count' => 0
                        ];
                    }
                    $competidoresPorCombinacion[$key]['count']++;
                }

                // Extraer áreas y niveles únicos para la sección de selección
                $areasSeleccionadas = collect($asignaciones)->pluck('area')->unique('id')->map(function($area) {
                    return [
                        'id' => $area->id,
                        'nombre' => $area->nombre
                    ];
                })->values()->toArray();

                $nivelesSeleccionados = collect($asignaciones)->pluck('nivel')->unique('id')->map(function($nivel) {
                    return [
                        'id' => $nivel->id,
                        'nombre' => $nivel->name
                    ];
                })->values()->toArray();

                // Calcular costos por cada combinación real
                foreach ($competidoresPorCombinacion as $combinacion) {
                    $costo = Cost::where('area_id', $combinacion['area']->id)
                        ->where('category_id', $combinacion['nivel']->id)
                        ->first();

                    if ($costo && isset($costo->price)) {
                        $subtotal = $costo->price * $combinacion['count'];

                        $costosPorCombinacion[] = [
                            'area' => [
                                'id' => $combinacion['area']->id,
                                'nombre' => $combinacion['area']->nombre
                            ],
                            'nivel' => [
                                'id' => $combinacion['nivel']->id,
                                'nombre' => $combinacion['nivel']->name
                            ],
                            'costo_unitario' => $costo->price,
                            'costo_unitario_formateado' => number_format($costo->price, 2),
                            'subtotal' => $subtotal,
                            'subtotal_formateado' => number_format($subtotal, 2),
                            'cantidad_competidores' => $combinacion['count']
                        ];
                    }
                }
            } else {
                // Para inscripciones individuales: usar la lógica original basada en los datos de competidores
                $areasSeleccionadas = collect($competidores)->pluck('area')->filter()->unique('id')->map(function($area) {
                    return [
                        'id' => $area['id'],
                        'nombre' => $area['nombre']
                    ];
                })->values()->toArray();

                $nivelesSeleccionados = collect($competidores)->pluck('nivel')->filter()->unique('id')->map(function($nivel) {
                    return [
                        'id' => $nivel['id'],
                        'nombre' => $nivel['nombre']
                    ];
                })->values()->toArray();

                foreach ($areasSeleccionadas as $area) {
                    foreach ($nivelesSeleccionados as $nivel) {
                        $costo = Cost::where('area_id', $area['id'])
                            ->where('category_id', $nivel['id'])
                            ->first();

                        if ($costo && isset($costo->price)) {
                            $subtotal = $costo->price * $cantidadCompetidores;

                            $costosPorCombinacion[] = [
                                'area' => [
                                    'id' => $area['id'],
                                    'nombre' => $area['nombre']
                                ],
                                'nivel' => [
                                    'id' => $nivel['id'],
                                    'nombre' => $nivel['nombre']
                                ],
                                'costo_unitario' => $costo->price,
                                'costo_unitario_formateado' => number_format($costo->price, 2),
                                'subtotal' => $subtotal,
                                'subtotal_formateado' => number_format($subtotal, 2),
                                'cantidad_competidores' => $cantidadCompetidores
                            ];
                        }
                    }
                }
            }

            $resumen['seleccion'] = [
                'areas' => $areasSeleccionadas,
                'niveles' => $nivelesSeleccionados,
                'costos_combinaciones' => $costosPorCombinacion
            ];

            $resumen['costo'] = [
                'monto_total' => $boleta->monto_total,
                'monto_total_formateado' => number_format($boleta->monto_total, 2),
                'cantidad_competidores' => $cantidadCompetidores,
                'desglose_costos' => $costosPorCombinacion
            ];

            return [
                'success' => true,
                'data' => $resumen
            ];

        } catch (Exception $e) {
            throw new Exception('Error al obtener los datos de la boleta: ' . $e->getMessage());
        }
    }

    public function obtenerBoletasPorOlimpiada()
    {
        try {
            $olimpiadas = Olimpiada::all();

            $boletasPorOlimpiada = [];

            foreach ($olimpiadas as $olimpiada) {
                $datoOlimpiada = [
                    'id' => $olimpiada->id,
                    'olympiad' => $olimpiada->nombre,
                    'receipts' => []
                ];

                $boletas = Boleta::with(['registrationProcess', 'registrationProcess.user'])
                    ->whereHas('registrationProcess', function($query) use ($olimpiada) {
                        $query->where('olimpiada_id', $olimpiada->id);
                    })
                    ->get();

                foreach ($boletas as $boleta) {
                    $datoOlimpiada['receipts'][] = [
                        'id' => $boleta->id,
                        'user' => $boleta->registrationProcess->user->full_name ?? 'Usuario Desconocido',
                        'boleta' => '#' . $boleta->numero_boleta,
                        'amount' => (float) $boleta->monto_total,
                        'date' => $boleta->fecha_emision ? $boleta->fecha_emision->format('Y-m-d') : date('Y-m-d'),
                        'status' => $boleta->estado === BoletaEstado::PAGADO ? 'Pagado' : 'Pendiente'
                    ];
                }
                $boletasPorOlimpiada[] = $datoOlimpiada;
            }

            return [
                'success' => true,
                'data' => $boletasPorOlimpiada
            ];

        } catch (Exception $e) {
            Log::error('Error al obtener todas las boletas por olimpiada: ' . $e->getMessage());
            throw new Exception('Error al obtener las boletas: ' . $e->getMessage());
        }
    }

    public function actualizarEstadoBoletas(UploadedFile $archivo)
    {
        try {
            $extension = strtolower($archivo->getClientOriginalExtension());
            if ($extension !== 'csv') {
                throw new Exception('El archivo debe ser CSV');
            }

            $csv = Reader::createFromPath($archivo->getRealPath(), 'r');
            $csv->setHeaderOffset(0);
            $records = Statement::create()->process($csv);

            DB::beginTransaction();

            $actualizados = 0;
            $errores = [];

            foreach ($records as $record) {
                $numeroBoleta = trim($record['numero_boleta'] ?? '');

                if (empty($numeroBoleta)) {
                    continue;
                }

                try {
                    $actualizado = DB::table('boleta')
                    ->where('numero_boleta', $numeroBoleta)
                    ->where('estado', BoletaEstado::PENDIENTE->value)
                    ->update([
                        'estado' => BoletaEstado::PAGADO->value,
                        'updated_at' => now()
                    ]);

                    if ($actualizado) {
                        $actualizados++;
                    } else {
                        $errores[] = "Boleta no encontrada o ya procesada: {$numeroBoleta}";
                    }
                } catch (Exception $e) {
                    Log::error("Error procesando boleta", [
                        'numero_boleta' => $numeroBoleta,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    $errores[] = "Error al procesar boleta {$numeroBoleta}: " . $e->getMessage();
                }
            }
            DB::commit();

            return [
                'success' => true,
                'mensaje' => "Se actualizaron {$actualizados} boletas correctamente",
                'actualizados' => $actualizados,
                'errores' => $errores
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error al procesar archivo de boletas:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception('Error al procesar el archivo: ' . $e->getMessage());
        }
    }

    /**
     * Calcula costos específicamente para inscripciones grupales
     */
    public function calcularCostosGrupales(RegistrationProcess $proceso, array $areasIds, array $nivelesIds)
    {
        $costoTotal = 0;
        $desgloseCostos = [];

        // Obtener asignaciones de competidores por área-nivel
        $asignaciones = CompetidorAreaNivel::where('registration_process_id', $proceso->id)
            ->with(['competidor', 'area', 'nivel'])
            ->get();

        // Si no hay asignaciones guardadas, calcular basándose en los IDs enviados
        if ($asignaciones->isEmpty()) {
            return $this->calcularCostosConIds($proceso, $areasIds, $nivelesIds);
        }

        // Agrupar competidores por combinación área-nivel
        $competidoresPorCombinacion = [];
        foreach ($asignaciones as $asignacion) {
            $key = $asignacion->area_id . '_' . $asignacion->category_level_id;
            if (!isset($competidoresPorCombinacion[$key])) {
                $competidoresPorCombinacion[$key] = [
                    'area_id' => $asignacion->area_id,
                    'nivel_id' => $asignacion->category_level_id,
                    'area' => $asignacion->area,
                    'nivel' => $asignacion->nivel,
                    'competidores' => []
                ];
            }
            $competidoresPorCombinacion[$key]['competidores'][] = $asignacion->competidor;
        }

        // Calcular costos por cada combinación área-nivel
        foreach ($competidoresPorCombinacion as $combinacion) {
            $costo = Cost::where('area_id', $combinacion['area_id'])
                ->where('category_id', $combinacion['nivel_id'])
                ->first();

            if ($costo && isset($costo->price)) {
                $cantidadEnCombinacion = count($combinacion['competidores']);
                $costoUnitario = $costo->price;
                $subtotal = $costoUnitario * $cantidadEnCombinacion;

                $desgloseCostos[] = [
                    'area' => [
                        'id' => $combinacion['area']->id,
                        'nombre' => $combinacion['area']->nombre
                    ],
                    'nivel' => [
                        'id' => $combinacion['nivel']->id,
                        'nombre' => $combinacion['nivel']->name
                    ],
                    'costo_unitario' => $costoUnitario,
                    'costo_unitario_formateado' => number_format($costoUnitario, 2),
                    'subtotal' => $subtotal,
                    'subtotal_formateado' => number_format($subtotal, 2),
                    'cantidad_competidores' => $cantidadEnCombinacion
                ];

                $costoTotal += $subtotal;
            }
        }

        return [
            'monto_total' => $costoTotal,
            'monto_total_formateado' => number_format($costoTotal, 2),
            'desglose_costos' => $desgloseCostos,
            'total_competidores' => $asignaciones->count()
        ];
    }

    /**
     * Calcula costos basándose en los IDs de áreas y niveles enviados (para inscripciones manuales)
     */
    private function calcularCostosConIds(RegistrationProcess $proceso, array $areasIds, array $nivelesIds)
    {
        $costoTotal = 0;
        $desgloseCostos = [];

        // Obtener cantidad de competidores en el proceso usando el repositorio
        $competidoresIds = $this->procesoRepository->obtenerIdsCompetidores($proceso->id);
        $totalCompetidores = count($competidoresIds);

        if ($totalCompetidores === 0) {
            return [
                'monto_total' => 0,
                'monto_total_formateado' => '0.00',
                'desglose_costos' => [],
                'total_competidores' => 0
            ];
        }

        // Crear combinaciones área-nivel (mapeo 1:1 por competidor)
        $combinacionesUnicas = [];
        $maxItems = max(count($areasIds), count($nivelesIds));

        for ($i = 0; $i < $maxItems; $i++) {
            $areaId = $areasIds[$i] ?? $areasIds[0];
            $nivelId = $nivelesIds[$i] ?? $nivelesIds[0];
            $key = $areaId . '_' . $nivelId;

            if (!isset($combinacionesUnicas[$key])) {
                $combinacionesUnicas[$key] = [
                    'area_id' => $areaId,
                    'nivel_id' => $nivelId,
                    'count' => 0
                ];
            }
            $combinacionesUnicas[$key]['count']++;
        }

        foreach ($combinacionesUnicas as $combinacion) {
            // Buscar el costo para esta combinación
            $costo = Cost::where('area_id', $combinacion['area_id'])
                ->where('category_id', $combinacion['nivel_id'])
                ->first();

            // Obtener información del área y nivel
            $area = Area::find($combinacion['area_id']);
            $nivel = CategoryLevel::find($combinacion['nivel_id']);

            if ($costo && isset($costo->price) && $area && $nivel) {
                $costoUnitario = (float) $costo->price;
                $cantidadCompetidores = $combinacion['count'];
                $subtotal = $costoUnitario * $cantidadCompetidores;

                $desgloseCostos[] = [
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
                    'subtotal' => $subtotal,
                    'subtotal_formateado' => number_format($subtotal, 2),
                    'cantidad_competidores' => $cantidadCompetidores
                ];

                $costoTotal += $subtotal;
            }
        }

        return [
            'monto_total' => $costoTotal,
            'monto_total_formateado' => number_format($costoTotal, 2),
            'desglose_costos' => $desgloseCostos,
            'total_competidores' => $totalCompetidores
        ];
    }
}
