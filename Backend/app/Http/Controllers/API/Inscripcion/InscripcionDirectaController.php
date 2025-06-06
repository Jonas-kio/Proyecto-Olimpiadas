<?php

namespace App\Http\Controllers\API\Inscripcion;

use App\Http\Controllers\Controller;
use App\Http\Requests\InscripcionRequest\InscripcionRequest;
use App\Models\Area;
use App\Models\CategoryLevel;
use App\Models\Cost;
use App\Models\Olimpiada;
use App\Models\RegistrationProcess;
use App\Services\InscripcionService;
use Exception;
use Illuminate\Http\Request;

class InscripcionDirectaController extends Controller
{
    protected $inscripcionService;

    public function __construct(InscripcionService $inscripcionService)
    {
        $this->inscripcionService = $inscripcionService;
    }

    public function inscripcionDirecta(InscripcionRequest $request, RegistrationProcess $proceso)
    {
        try {
            $datos = $request->formatData();

            $olimpiada = Olimpiada::findOrFail($datos['olimpiada_id']);

            if (!$olimpiada->activo || $olimpiada->fecha_fin < now()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'La olimpiada no está disponible para inscripciones'
                ], 400);
            }

            $boleta = $this->inscripcionService->inscripcionIndividual($proceso, $datos);


            return response()->json([
                'status' => 'success',
                'message' => 'Inscripción completada exitosamente',
                'data' => [
                    'proceso_id' => $proceso->id,
                    'boleta_id' => $boleta->id,
                    'numero_boleta' => $boleta->numero_boleta,
                    'monto_total' => $boleta->monto_total,
                    'fecha_expiracion' => $boleta->fecha_expiracion->format('Y-m-d')
                ]
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function calcularCostosPreliminares(Request $request, RegistrationProcess $proceso)
    {
        $areasIds = $request->areas_ids;
        $nivelesIds = $request->niveles_ids;
        $cantidadCompetidores = $request->cantidad_competidores ?? 1;

        if ($proceso == null) {
            return response()->json([
                'success' => false,
                'message' => 'El proceso de inscripción no existe.'
            ], 400);
        }

        $costoTotal = 0;
        $desgloseCostos = [];

        foreach ($areasIds as $areaId) {
            foreach ($nivelesIds as $nivelId) {
                $costo = Cost::where('area_id', $areaId)
                    ->where('category_id', $nivelId)
                    ->first();

                if ($costo && isset($costo->price)) {
                    $area = Area::find($areaId);
                    $nivel = CategoryLevel::find($nivelId);
                    $costoUnitario = $costo->price;
                    $subtotal = $costoUnitario * $cantidadCompetidores;

                    $desgloseCostos[] = [
                        'area' => [
                            'id' => $areaId,
                            'nombre' => $area->nombre
                        ],
                        'nivel' => [
                            'id' => $nivelId,
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
        }
        return response()->json([
            'success' => true,
            'data' => [
                'monto_total' => $costoTotal,
                'monto_total_formateado' => number_format($costoTotal, 2),
                'cantidad_competidores' => $cantidadCompetidores,
                'desglose_costos' => $desgloseCostos
            ]
        ]);
    }
}
