<?php

namespace App\Http\Controllers\API\Inscripcion;

use App\Http\Controllers\Controller;
use App\Http\Requests\InscripcionRequest\InscripcionRequest;
use App\Models\Olimpiada;
use App\Models\RegistrationProcess;
use App\Services\InscripcionService;
use Exception;


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
}
