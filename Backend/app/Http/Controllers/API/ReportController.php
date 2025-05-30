<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RegistrationProcess;
use App\Models\Competitor;
use App\Models\Area;
use App\Models\DetalleInscripcion;
use App\Models\Olimpiada;
use App\Models\CategoryLevel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ReportController extends Controller
{
    /**
     * Determina el nombre correcto de la tabla de registro
     */
    private function getTableName()
    {
        if (Schema::hasTable('registration_process')) {
            return 'registration_process';
        } elseif (Schema::hasTable('registration_processes')) {
            return 'registration_processes';
        }
        throw new \Exception('Tabla de registro no encontrada');
    }

    /**
     * Obtiene las opciones para los filtros del frontend
     */
    public function getFilterOptions()
    {
        try {
            Log::info('Obteniendo opciones de filtros');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'olimpiadas' => Olimpiada::select('id', 'nombre as name')->where('activo', true)->get(),
                    'areas' => Area::select('id', 'nombre as name')->where('activo', true)->get(),
                    'niveles' => CategoryLevel::select('id', 'name')->get(),
                    'estados_proceso' => [
                        ['value' => 'pending', 'label' => 'Pendiente'],
                        ['value' => 'approved', 'label' => 'Aprobado'],
                        ['value' => 'rejected', 'label' => 'Rechazado']
                    ],
                    'estados_pago' => [
                        ['value' => 'verified', 'label' => 'Verificado'],
                        ['value' => 'pending', 'label' => 'Pendiente']
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error obteniendo opciones de filtros: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener opciones de filtros',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Obtiene el reporte detallado de inscripciones con filtros opcionales
     */
    public function getInscriptionReport(Request $request)
    {
        try {
            Log::info('Iniciando getInscriptionReport con filtros:', $request->all());
            
            // Construye la consulta base con las relaciones correctas
            $query = RegistrationProcess::with([
                'participante',                           // Relación a User
                'olimpiada',                             // Relación a Olimpiada
                'detalleInscripcion',                    // Relación a DetalleInscripcion
                'detalleInscripcion.competidor',         // Competidor a través del detalle
                'detalleInscripcion.area',               // Área a través del detalle
                'detalleInscripcion.nivel_categoria'     // Categoría a través del detalle
            ]);

            // Aplica filtro por olimpiada si se proporciona
            if ($request->has('olimpiada_id') && !empty($request->olimpiada_id)) {
                $query->where('olimpiada_id', $request->olimpiada_id);
                Log::info('Aplicando filtro por olimpiada:', ['olimpiada_id' => $request->olimpiada_id]);
            }

            // Aplica filtro por área si se proporciona
            if ($request->has('area_id') && !empty($request->area_id)) {
                $query->whereHas('detalleInscripcion', function($q) use ($request) {
                    $q->where('area_id', $request->area_id);
                });
                Log::info('Aplicando filtro por área:', ['area_id' => $request->area_id]);
            }

            // Aplica filtro por nivel/categoría si se proporciona
            if ($request->has('level_id') && !empty($request->level_id)) {
                $query->whereHas('detalleInscripcion', function($q) use ($request) {
                    $q->where('categoria_id', $request->level_id);
                });
                Log::info('Aplicando filtro por nivel:', ['level_id' => $request->level_id]);
            }

            // Aplica filtro por status del proceso si se proporciona
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
                Log::info('Aplicando filtro por status:', ['status' => $request->status]);
            }

            // Aplica filtro por estado de pago si se proporciona
            if ($request->has('payment_status') && !empty($request->payment_status)) {
                $paymentStatus = $request->payment_status === 'verified' ? true : false;
                $query->whereHas('detalleInscripcion', function($q) use ($paymentStatus) {
                    $q->where('status', $paymentStatus);
                });
                Log::info('Aplicando filtro por estado de pago:', ['payment_status' => $request->payment_status]);
            }

            // Ejecuta la consulta
            $registrations = $query->get();
            Log::info('Registros encontrados:', ['count' => $registrations->count()]);

            // Transforma cada registro al formato requerido
            $formattedRegistrations = $registrations->map(function ($registration) {
                try {
                    // Verifica que el registro tenga un participante válido
                    if (!$registration->participante) {
                        Log::warning('Registro sin participante:', ['id' => $registration->id]);
                        return null;
                    }

                    // Verifica que tenga detalle de inscripción
                    if (!$registration->detalleInscripcion) {
                        Log::warning('Registro sin detalle de inscripción:', ['id' => $registration->id]);
                        return null;
                    }

                    // Obtener información del detalle
                    $detalle = $registration->detalleInscripcion;

                    // Mapear estados según el diseño del Figma
                    $estadoProceso = match($registration->getRawOriginal('status')) {
                        'pending' => 'Pendiente',
                        'approved' => 'Inscrito', 
                        'rejected' => 'Rechazado',
                        default => 'Pendiente'
                    };

                    $estadoPago = match($detalle->status) {
                        true => 'Verificado',
                        false => 'Pendiente', 
                        default => 'Pendiente'
                    };

                    // Retorna el formato estructurado para el Figma
                    return [
                        'id' => $registration->id,
                        'participante' => trim(($detalle->competidor->nombres ?? 'N/A') . ' ' . ($detalle->competidor->apellidos ?? '')),
                        'competitor' => [
                            'id' => $detalle->competidor->id ?? null,
                            'name' => $detalle->competidor->nombres ?? 'N/A',
                            'lastname' => $detalle->competidor->apellidos ?? 'N/A',
                            'dni' => $detalle->competidor->documento_identidad ?? 'N/A',
                        ],
                        'area' => $detalle->area->nombre ?? 'N/A',
                        'nivel' => $detalle->nivel_categoria->name ?? 'N/A',
                        'olimpiada' => $registration->olimpiada->nombre ?? 'N/A',
                        'type' => $registration->type ?? 'N/A',
                        'estado' => $estadoProceso,
                        'payment_status' => $estadoPago,
                        'monto' => $detalle->monto ?? 0,
                        'fecha' => $registration->created_at ? $registration->created_at->format('Y-m-d') : null,
                        'fecha_completa' => $registration->created_at ? $registration->created_at->format('Y-m-d H:i:s') : null,
                        'start_date' => $registration->start_date ? $registration->start_date->format('Y-m-d H:i:s') : null,
                        'created_at' => $registration->created_at ? $registration->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $registration->updated_at ? $registration->updated_at->format('Y-m-d H:i:s') : null
                    ];
                } catch (\Exception $e) {
                    Log::error('Error procesando registro individual:', [
                        'registration_id' => $registration->id ?? 'desconocido',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return null;
                }
            })->filter()->values();

            // Agrupar por olimpiada para el frontend
            $groupedByOlimpiada = $formattedRegistrations->groupBy('olimpiada');

            Log::info('Registros formateados:', ['count' => $formattedRegistrations->count()]);

            return response()->json([
                'success' => true,
                'data' => $formattedRegistrations,
                'grouped_data' => $groupedByOlimpiada,
                'total_records' => $formattedRegistrations->count(),
                'message' => "Se encontraron {$formattedRegistrations->count()} registros con los filtros seleccionados",
                'filters_applied' => $request->only(['olimpiada_id', 'area_id', 'level_id', 'status', 'payment_status'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getInscriptionReport: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el reporte de inscripciones',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Obtiene un resumen estadístico de las inscripciones
     */
    public function getReportSummary()
    {
        try {
            Log::info('=== INICIANDO getReportSummary ===');
            
            $tableName = $this->getTableName();
            Log::info('Usando nombre de tabla: ' . $tableName);
            
            // Conteo básico
            $totalRegistrations = DB::table($tableName)->count();
            Log::info('Total de registros encontrados:', ['count' => $totalRegistrations]);

            if ($totalRegistrations === 0) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'total_registrations' => 0,
                        'by_status' => [],
                        'by_area' => [],
                        'by_level' => [],
                        'by_type' => [],
                        'by_olimpiada' => [],
                        'payment_summary' => [
                            'total_recaudado' => 0,
                            'pagos_pendientes_count' => 0,
                            'pagos_verificados_count' => 0,
                            'pagos_verificados_porcentaje' => 0,
                            'total_detalles' => 0
                        ],
                        'message' => 'No hay registros de inscripciones disponibles'
                    ]
                ]);
            }

            // Agrupación por status
            $byStatus = collect();
            try {
                $statusResults = DB::select("
                    SELECT status, COUNT(*) as total 
                    FROM {$tableName} 
                    GROUP BY status
                ");
                
                $byStatus = collect($statusResults)->map(function ($item) {
                    $label = match($item->status) {
                        'pending' => 'Pendiente',
                        'approved' => 'Aprobado',
                        'rejected' => 'Rechazado',
                        default => $item->status
                    };
                    
                    return [
                        'status' => (string) $item->status,
                        'label' => $label,
                        'total' => (int) $item->total
                    ];
                });
                
                Log::info('Agrupación por status exitosa:', ['count' => $byStatus->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por status:', ['error' => $e->getMessage()]);
            }

            // Agrupación por área
            $byArea = collect();
            try {
                $byArea = RegistrationProcess::with('detalleInscripcion.area')
                    ->get()
                    ->filter(function($item) {
                        return $item->detalleInscripcion && $item->detalleInscripcion->area;
                    })
                    ->groupBy(function($item) {
                        return $item->detalleInscripcion->area->nombre ?? 'Sin Área';
                    })
                    ->map(function ($group, $areaName) {
                        return [
                            'name' => $areaName,
                            'total' => $group->count()
                        ];
                    })->values();
                
                Log::info('Agrupación por área exitosa:', ['count' => $byArea->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por área:', ['error' => $e->getMessage()]);
            }

            // Agrupación por nivel/categoría
            $byLevel = collect();
            try {
                $byLevel = RegistrationProcess::with('detalleInscripcion.nivel_categoria')
                    ->get()
                    ->filter(function($item) {
                        return $item->detalleInscripcion && $item->detalleInscripcion->nivel_categoria;
                    })
                    ->groupBy(function($item) {
                        return $item->detalleInscripcion->nivel_categoria->name ?? 'Sin Nivel';
                    })
                    ->map(function ($group, $levelName) {
                        return [
                            'name' => $levelName,
                            'total' => $group->count()
                        ];
                    })->values();
                
                Log::info('Agrupación por nivel exitosa:', ['count' => $byLevel->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por nivel:', ['error' => $e->getMessage()]);
            }

            // Agrupación por olimpiada
            $byOlimpiada = collect();
            try {
                $olimpiadaResults = DB::select("
                    SELECT o.nombre, COUNT(rp.id) as total 
                    FROM {$tableName} rp
                    JOIN olimpiadas o ON rp.olimpiada_id = o.id
                    GROUP BY o.id, o.nombre
                ");
                
                $byOlimpiada = collect($olimpiadaResults)->map(function ($item) {
                    return [
                        'name' => (string) $item->nombre,
                        'total' => (int) $item->total
                    ];
                });
                
                Log::info('Agrupación por olimpiada exitosa:', ['count' => $byOlimpiada->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por olimpiada:', ['error' => $e->getMessage()]);
            }

            // Agrupación por tipo
            $byType = collect();
            try {
                $typeResults = DB::select("
                    SELECT type, COUNT(*) as total 
                    FROM {$tableName} 
                    WHERE type IS NOT NULL
                    GROUP BY type
                ");
                
                $byType = collect($typeResults)->map(function ($item) {
                    return [
                        'type' => (string) $item->type,
                        'total' => (int) $item->total
                    ];
                });
                
                Log::info('Agrupación por tipo exitosa:', ['count' => $byType->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por tipo:', ['error' => $e->getMessage()]);
            }

            // Resumen de pagos desde DetalleInscripcion
            $paymentSummary = [
                'total_recaudado' => 0,
                'pagos_pendientes_count' => 0,
                'pagos_verificados_count' => 0,
                'pagos_verificados_porcentaje' => 0,
                'total_detalles' => 0
            ];

            try {
                // Total recaudado de pagos confirmados (status = true)
                $totalRecaudado = DetalleInscripcion::where('status', true)->sum('monto');

                // Conteo de pagos pendientes (status = false)
                $pagosPendientesCount = DetalleInscripcion::where('status', false)->count();

                // Conteo de pagos verificados (status = true)
                $pagosVerificadosCount = DetalleInscripcion::where('status', true)->count();

                // Total de detalles de inscripción
                $totalDetalles = DetalleInscripcion::count();

                // Calcula porcentaje de pagos verificados
                $pagosVerificadosPorcentaje = $totalDetalles > 0 ? 
                    ($pagosVerificadosCount / $totalDetalles * 100) : 0;

                $paymentSummary = [
                    'total_recaudado' => (float) $totalRecaudado,
                    'pagos_pendientes_count' => $pagosPendientesCount,
                    'pagos_verificados_count' => $pagosVerificadosCount,
                    'pagos_verificados_porcentaje' => round($pagosVerificadosPorcentaje, 2),
                    'total_detalles' => $totalDetalles
                ];

                Log::info('Resumen de pagos calculado:', $paymentSummary);

            } catch (\Exception $e) {
                Log::error('Error calculando resumen de pagos:', ['error' => $e->getMessage()]);
                $paymentSummary['error'] = config('app.debug') ? $e->getMessage() : 'Error al obtener resumen de pagos';
            }

            $summary = [
                'total_registrations' => $totalRegistrations,
                'table_used' => $tableName,
                'by_status' => $byStatus,
                'by_area' => $byArea,
                'by_level' => $byLevel,
                'by_type' => $byType,
                'by_olimpiada' => $byOlimpiada,
                'payment_summary' => $paymentSummary
            ];

            Log::info('=== getReportSummary COMPLETADO EXITOSAMENTE ===');

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);

        } catch (\Exception $e) {
            Log::error('=== ERROR FATAL en getReportSummary ===', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el resumen del reporte',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Exporta el reporte a diferentes formatos (futuro)
     */
    public function exportReport(Request $request)
    {
        // TODO: Implementar exportación a Excel/PDF
        return response()->json([
            'success' => false,
            'message' => 'Funcionalidad de exportación en desarrollo'
        ], 501);
    }
}