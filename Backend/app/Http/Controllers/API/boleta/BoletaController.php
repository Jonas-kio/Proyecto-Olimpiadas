<?php

namespace App\Http\Controllers\API\boleta;

use App\Http\Controllers\Controller;
use App\Http\Requests\OCR\ActualizarBoletasRequest;
use App\Services\BoletaService;
use Exception;
use Illuminate\Http\JsonResponse;

class BoletaController extends Controller
{
    protected $boletaService;

    public function __construct(BoletaService $boletaService)
    {
        $this->boletaService = $boletaService;
    }

    //obtener listado de boletas
    public function obtenerBoletasPorOlimpiada(): JsonResponse
    {
        try {
            $resultado = $this->boletaService->obtenerBoletasPorOlimpiada();
            return response()->json($resultado);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al obtener las boletas: ' . $e->getMessage()
            ], 400);
        }
    }

    public function actualizarEstadoBoletas(ActualizarBoletasRequest $request): JsonResponse
    {
        try {
            $resultado = $this->boletaService->actualizarEstadoBoletas($request->file('archivo'));

            return response()->json([
                'success' => true,
                'mensaje' => $resultado['mensaje'],
                'data' => [
                    'actualizados' => $resultado['actualizados'],
                    'errores' => $resultado['errores']
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al procesar el archivo: ' . $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    public function obtenerDatosBoleta($procesoId, $boletaId): JsonResponse
    {
        try {
            $resultado = $this->boletaService->obtenerDatosBoleta($procesoId, $boletaId);
            return response()->json($resultado);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos de boleta: ' . $e->getMessage()
            ], 400);
        }
    }
}
