<?php

namespace App\Services;

use App\Enums\BoletaEstado;
use App\Enums\EstadoInscripcion;
use App\Events\BoletaGenerada;
use App\Models\Boleta;
use App\Models\CompetidorAreaNivel;
use App\Models\CompetidorTutor;
use App\Models\Cost;
use App\Models\DetalleInscripcion;
use App\Models\RegistrationProcess;
use App\Repositories\ProcesoInscripcionRepository;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Http\UploadedFile;
use League\Csv\Reader;
use League\Csv\Statement;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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


        $competidoresIds = $this->procesoRepository->obtenerIdsCompetidores($proceso->id);
        if (empty($competidoresIds)) {
            throw new \Exception('El proceso de inscripción no tiene competidores asociados');
        }

        $areasIds = $this->procesoRepository->obtenerAreasSeleccionadas($proceso->id);
        $nivelesIds = $this->procesoRepository->obtenerNivelesSeleccionados($proceso->id);

        if (empty($areasIds) || empty($nivelesIds)) {
            throw new \Exception('Debe seleccionar al menos un área y un nivel para generar la boleta');
        }

        DB::beginTransaction();

        try {

            $montoTotal = 0;
            $fechaExpiracion = $proceso->olimpiada->fecha_fin;
            if (!$fechaExpiracion) {
                throw new \Exception('La olimpiada no tiene definida una fecha de finalización');
            }

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

            DB::commit();

            event(new BoletaGenerada($boleta));

            return $boleta;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error al generar la boleta: ' . $e->getMessage());
        }
    }

    protected function generarCodigoBoleta($tipo = null)
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
                    'curso' => $detalle->competidor->curso,
                    'colegio' => $detalle->competidor->colegio,
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

            // Datos de selección y costos
            $areasSeleccionadas = collect($competidores)->pluck('area')->unique('id')->values()->toArray();
            $nivelesSeleccionados = collect($competidores)->pluck('nivel')->unique('id')->values()->toArray();
            $costosPorCombinacion = [];
            foreach ($areasSeleccionadas as $area) {
                foreach ($nivelesSeleccionados as $nivel) {
                    $costo = Cost::where('area_id', $area['id'])
                        ->where('category_id', $nivel['id'])
                        ->first();

                    if ($costo && isset($costo->price)) {
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
                            'costo_unitario_formateado' => number_format($costo->price, 2)
                        ];
                    }
                }
            }

            $resumen['seleccion'] = [
                'areas' => $areasSeleccionadas,
                'niveles' => $nivelesSeleccionados,
                'costos_combinaciones' => $costosPorCombinacion
            ];

            $cantidadCompetidores = count(array_unique(array_column($competidores, 'id')));
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
            Log::error('Error al obtener datos de boleta:', [
                'proceso_id' => $procesoId,
                'boleta_id' => $boletaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new Exception('Error al obtener los datos de la boleta: ' . $e->getMessage());
        }
    }

    public function obtenerBoletasPorOlimpiada($olimpiadaId)
    {
        try {
            $boletas = Boleta::with([
                'registrationProcess',
                'registrationProcess.olimpiada',
                'registrationProcess.user'
            ])
            ->whereHas('registrationProcess', function ($query) use ($olimpiadaId) {
                $query->where('olimpiada_id', $olimpiadaId);
            })
            ->get()
            ->map(function ($boleta) {
                return [
                    'id' => $boleta->id,
                    'numero_boleta' => $boleta->numero_boleta,
                    'estado' => $boleta->estado->value,
                    'estado_formateado' => ucfirst($boleta->estado->value),
                    'validado' => $boleta->validado,
                    'usuario' => $boleta->registrationProcess->user->full_name,
                    'tipo_proceso' => ucfirst($boleta->registrationProcess->type),
                    'fecha_emision' => Carbon::parse($boleta->fecha_emision)->format('d/m/Y'),
                    'fecha_expiracion' => Carbon::parse($boleta->fecha_expiracion)->format('d/m/Y'),
                    'monto_total' => number_format($boleta->monto_total, 2),
                ];
            });

            $estadisticas = [
                'total_boletas' => $boletas->count(),
                'pendientes' => $boletas->where('estado', BoletaEstado::PENDIENTE->value)->count(),
                'pagadas' => $boletas->where('estado', BoletaEstado::PAGADO->value)->count(),
                'validadas' => $boletas->where('validado', true)->count(),
            ];

            return [
                'success' => true,
                'data' => [
                    'boletas' => $boletas,
                    'estadisticas' => $estadisticas,
                    'totales' => [
                        'monto_total' => number_format($boletas->sum('monto_total'), 2),
                        'cantidad_boletas' => $boletas->count()
                    ]
                ]
            ];

        } catch (Exception $e) {
            Log::error('Error al obtener boletas: ' . $e->getMessage());
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
                // Usamos DB::table directamente para la actualización
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

}
