<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RegistrationProcess;
use App\Models\Competitor;
use App\Models\Area;
use App\Models\DetalleInscripcion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ReportController extends Controller
{
    /**
     * Determina el nombre correcto de la tabla de registro
     * Verifica si existe registration_processes o registration_process
     */
    private function getTableName()
    {
        // Intenta determinar el nombre correcto de la tabla
        if (Schema::hasTable('registration_processes')) {
            return 'registration_processes';
        } elseif (Schema::hasTable('registration_process')) {
            return 'registration_process';
        }
        throw new \Exception('Tabla de registro no encontrada');
    }

    /**
     * Obtiene el reporte detallado de inscripciones con filtros opcionales
     * 
     * @param Request $request - Puede contener filtros: area_id, level_id, status
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInscriptionReport(Request $request)
    {
        try {
            Log::info('Iniciando getInscriptionReport con filtros:', $request->all());
            
            // Construye la consulta base con todas las relaciones necesarias
            $query = RegistrationProcess::with([
                'participante',                         // Datos del competidor
                'detalleInscripcion',                  // Detalles de la inscripción
                'detalleInscripcion.area',             // Área de competencia
                'detalleInscripcion.nivel_categoria'   // Nivel/categoría
            ]);

            // Aplica filtro por área si se proporciona
            if ($request->has('area_id') && !empty($request->area_id)) {
                $query->whereHas('detalleInscripcion', function($q) use ($request) {
                    $q->where('area_id', $request->area_id);
                });
            }

            // Aplica filtro por nivel/categoría si se proporciona
            if ($request->has('level_id') && !empty($request->level_id)) {
                $query->whereHas('detalleInscripcion', function($q) use ($request) {
                    $q->where('categoria_id', $request->level_id);
                });
            }

            // Aplica filtro por status si se proporciona
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Ejecuta la consulta y obtiene los resultados
            $registrations = $query->get();
            Log::info('Registros encontrados:', ['count' => $registrations->count()]);

            // Transforma cada registro al formato requerido por el frontend
            $formattedRegistrations = $registrations->map(function ($registration) {
                try {
                    // Verifica que el registro tenga un participante válido
                    if (!$registration->participante) {
                        Log::warning('Registro sin participante:', ['id' => $registration->id]);
                        return null;
                    }

                    // Manejo seguro del status - convierte a string
                    $status = 'N/A';
                    try {
                        if ($registration->status) {
                            // Maneja enums de Laravel
                            if (is_object($registration->status)) {
                                if (method_exists($registration->status, 'value')) {
                                    $status = $registration->status->value;
                                } elseif (method_exists($registration->status, 'name')) {
                                    $status = $registration->status->name;
                                } elseif (property_exists($registration->status, 'value')) {
                                    $status = $registration->status->value;
                                } else {
                                    $status = (string) $registration->status;
                                }
                            } else {
                                $status = (string) $registration->status;
                            }
                        }
                    } catch (\Exception $e) {
                        Log::warning('Error obteniendo status:', ['error' => $e->getMessage(), 'id' => $registration->id]);
                        $status = 'Error';
                    }

                    // Manejo seguro del nivel/categoría
                    $levelName = $registration->detalleInscripcion->nivel_categoria->name ?? 'N/A';

                    // Retorna el formato estructurado para el frontend
                    return [
                        'id' => $registration->id,
                        'competitor' => [
                            'id' => $registration->participante->id ?? null,
                            'name' => $registration->participante->name ?? 'N/A',
                            'lastname' => $registration->participante->lastname ?? 'N/A',
                            'dni' => $registration->participante->dni ?? 'N/A',
                        ],
                        'area' => $registration->detalleInscripcion->area->name ?? 'N/A',
                        'level' => $levelName,
                        'status' => $status,
                        'created_at' => $registration->created_at ? $registration->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $registration->updated_at ? $registration->updated_at->format('Y-m-d H:i:s') : null
                    ];
                } catch (\Exception $e) {
                    // Log de errores individuales para debugging
                    Log::error('Error procesando registro individual:', [
                        'registration_id' => $registration->id ?? 'desconocido',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return null;
                }
            })->filter()->values(); // Filtra nulos y reindexar array

            Log::info('Registros formateados:', ['count' => $formattedRegistrations->count()]);

            // Retorna respuesta exitosa con los datos formateados
            return response()->json([
                'success' => true,
                'data' => $formattedRegistrations
            ]);
        } catch (\Exception $e) {
            // Manejo de errores generales
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
     * Obtiene un resumen estadístico completo de las inscripciones
     * Incluye totales, agrupaciones por área/nivel/status y resumen de pagos
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReportSummary()
    {
        try {
            Log::info('=== INICIANDO getReportSummary ===');
            
            // Obtiene el nombre correcto de la tabla
            $tableName = $this->getTableName();
            Log::info('Usando nombre de tabla: ' . $tableName);
            
            // Paso 1: Prueba de conteo básico
            Log::info('Paso 1: Probando conteo básico');
            $totalRegistrations = 0;
            try {
                $totalRegistrations = DB::table($tableName)->count();
                Log::info('Total de registros encontrados:', ['count' => $totalRegistrations]);
            } catch (\Exception $e) {
                Log::error('Error contando registros:', ['error' => $e->getMessage()]);
                throw $e;
            }

            // Estructura básica del resumen
            $summary = [
                'total_registrations' => $totalRegistrations,
                'table_used' => $tableName
            ];

            // Solo procede con las agrupaciones si hay datos
            if ($totalRegistrations === 0) {
                Log::info('No se encontraron registros, retornando resumen vacío');
                return response()->json([
                    'success' => true,
                    'data' => [
                        'total_registrations' => 0,
                        'by_status' => [],
                        'by_area' => [],
                        'by_level' => [],
                        'message' => 'No hay registros de inscripciones disponibles'
                    ]
                ]);
            }

            // Paso 2: Agrupación por status usando SQL directo
            Log::info('Paso 2: Probando agrupación por status');
            try {
                $statusResults = DB::select("
                    SELECT status, COUNT(*) as total 
                    FROM {$tableName} 
                    GROUP BY status
                ");
                
                // Transforma los resultados a formato consistente
                $byStatus = collect($statusResults)->map(function ($item) {
                    return [
                        'status' => (string) $item->status,
                        'total' => (int) $item->total
                    ];
                });
                
                $summary['by_status'] = $byStatus;
                Log::info('Agrupación por status exitosa:', ['count' => $byStatus->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por status:', ['error' => $e->getMessage()]);
                $summary['by_status'] = [];
            }

            // Paso 3: Agrupación por área
            Log::info('Paso 3: Probando agrupación por área');
            try {
                // Agrupa por nombre de área usando la relación cargada
                $byArea = RegistrationProcess::with('detalleInscripcion.area')
                    ->get() // Obtiene todos los registros primero
                    ->groupBy(function($item) {
                        // Agrupa por nombre de área o 'Sin Área' si no tiene
                        return $item->detalleInscripcion->area->name ?? 'Sin Área';
                    })
                    ->map(function ($group, $areaName) {
                        return [
                            'name' => $areaName,
                            'total' => $group->count()
                        ];
                    })->values(); // Reindexar para obtener array numérico
                
                $summary['by_area'] = $byArea;
                Log::info('Agrupación por área exitosa:', ['count' => $byArea->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por área:', ['error' => $e->getMessage()]);
                $summary['by_area'] = [];
            }

            // Paso 4: Agrupación por nivel/categoría
            Log::info('Paso 4: Probando agrupación por nivel');
            try {
                // Agrupa por nombre de nivel usando la relación detalleInscripcion
                $byLevel = RegistrationProcess::with('detalleInscripcion.nivel_categoria')
                    ->get()
                    ->groupBy(function($item) {
                        return $item->detalleInscripcion->nivel_categoria->name ?? 'Sin Nivel';
                    })
                    ->map(function ($group, $levelName) {
                        return [
                            'name' => $levelName,
                            'total' => $group->count()
                        ];
                    })->values();
                
                $summary['by_level'] = $byLevel;
                Log::info('Agrupación por nivel exitosa:', ['count' => $byLevel->count()]);
            } catch (\Exception $e) {
                Log::error('Error en agrupación por nivel:', ['error' => $e->getMessage()]);
                $summary['by_level'] = [];
            }

            // Paso 5: Resumen de pagos desde DetalleInscripcion
            Log::info('Paso 5: Calculando resumen de pagos');
            try {
                // Total recaudado de pagos confirmados
                $totalRecaudado = DetalleInscripcion::where('status', 'pagado') // Asumiendo 'pagado' como status de pagado
                    ->sum('monto');

                // Conteo de pagos pendientes
                $pagosPendientesCount = DetalleInscripcion::where('status', 'pendiente') // Asumiendo 'pendiente' como status
                    ->count();

                // Total de detalles de inscripción
                $totalDetalles = DetalleInscripcion::count();

                // Calcula porcentaje de pagos verificados
                $pagosVerificadosPorcentaje = $totalDetalles > 0 ? ($totalDetalles - $pagosPendientesCount) / $totalDetalles * 100 : 0;

                $summary['payment_summary'] = [
                    'total_recaudado' => $totalRecaudado,
                    'pagos_pendientes_count' => $pagosPendientesCount,
                    'pagos_verificados_porcentaje' => round($pagosVerificadosPorcentaje, 2),
                    'total_detalles' => $totalDetalles // Incluye total para contexto
                ];
                Log::info('Resumen de pagos calculado:', $summary['payment_summary']);

            } catch (\Exception $e) {
                Log::error('Error calculando resumen de pagos:', ['error' => $e->getMessage()]);
                // Proporciona datos vacíos por defecto en caso de error
                $summary['payment_summary'] = [
                    'total_recaudado' => 0,
                    'pagos_pendientes_count' => 0,
                    'pagos_verificados_porcentaje' => 0,
                    'total_detalles' => 0,
                    'error' => config('app.debug') ? $e->getMessage() : 'Error al obtener resumen de pagos'
                ];
            }

            Log::info('=== getReportSummary COMPLETADO EXITOSAMENTE ===');

            // Retorna el resumen completo
            return response()->json([
                'success' => true,
                'data' => $summary
            ]);

        } catch (\Exception $e) {
            // Manejo de errores fatales
            Log::error('=== ERROR FATAL en getReportSummary ===', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el resumen del reporte',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
                'debug_info' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }
}