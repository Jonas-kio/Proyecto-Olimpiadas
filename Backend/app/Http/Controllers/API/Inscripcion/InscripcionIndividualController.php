<?php

namespace App\Http\Controllers\API\Inscripcion;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInscripcionIndividualRequest;
use App\Models\InscripcionIndividual;
use App\Models\Olimpiada;
use App\Services\InscripcionIndividualService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class InscripcionIndividualController extends Controller
{
    protected $inscripcionIndividualService;

    public function __construct(InscripcionIndividualService $inscripcionIndividualService)
    {
        $this->inscripcionIndividualService = $inscripcionIndividualService;
    }

    public function store(StoreInscripcionIndividualRequest $request): JsonResponse
    {
        try {
            Log::info('Iniciando proceso de inscripción individual', [
                'olimpiada_id' => $request->olimpiada_id,
                'participante_id' => $request->participante_id,
                'area_id' => $request->area_id
            ]);

            $data = $request->validated();
            $comprobantePago = $request->file('comprobante_pago');

            $inscripcion = $this->inscripcionIndividualService->createInscripcion($data, $comprobantePago);

            Log::info('Inscripción individual creada exitosamente', [
                'inscripcion_id' => $inscripcion->id
            ]);

            return response()->json([
                'message' => 'Inscripción individual creada exitosamente',
                'data' => $inscripcion
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear inscripción individual', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al crear la inscripción individual',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(InscripcionIndividual $inscripcion): JsonResponse
    {
        try {
            $inscripcion->load(['olimpiada', 'participante', 'area', 'evaluacion']);
            return $this->successResponse([
                'inscripcion' => $inscripcion
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener la inscripción', $e);
        }
    }

    private function successResponse(array $data, string $message = 'Operación exitosa', int $status = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $status);
    }

    private function errorResponse(string $message, ?\Exception $e = null, int $status = 500): JsonResponse
    {
        if ($e) {
            Log::error($message . ': ' . $e->getMessage());
            Log::error($e->getTraceAsString());
        }

        return response()->json([
            'status' => 'error',
            'message' => $message,
            'error' => $e ? $e->getMessage() : null
        ], $status);
    }
} 