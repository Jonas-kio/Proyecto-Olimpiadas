<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inscripcion\IniciarInscripcionRequest;
use App\Http\Requests\Inscripcion\ActualizarPagoRequest;
use App\Services\InscripcionService;
use Illuminate\Http\JsonResponse;

class InscripcionController extends Controller
{
    protected $inscripcionService;

    public function __construct(InscripcionService $inscripcionService)
    {
        $this->inscripcionService = $inscripcionService;
    }

    public function iniciarProceso(IniciarInscripcionRequest $request): JsonResponse
    {
        $existingRegistration = $this->inscripcionService->verificarInscripcionExistente(
            $request->competitor_id,
            $request->olimpiada_id
        );

        if ($existingRegistration) {
            return response()->json([
                'message' => 'Ya existe una inscripción activa para este competidor en esta olimpiada',
                'registration' => $existingRegistration
            ], 409);
        }

        $registrationProcess = $this->inscripcionService->crearProcesoInscripcion($request->validated());

        return response()->json([
            'message' => 'Proceso de inscripción iniciado exitosamente',
            'registration' => $registrationProcess->load(['competitor', 'tutor', 'olimpiada', 'area', 'categoryLevel', 'paymentBill']),
            'payment_bill' => $registrationProcess->paymentBill
        ], 201);
    }

    public function actualizarEstadoPago(ActualizarPagoRequest $request, $paymentBillId): JsonResponse
    {
        $result = $this->inscripcionService->actualizarEstadoPago($paymentBillId, $request->validated());

        return response()->json([
            'message' => 'Pago registrado exitosamente',
            'payment' => $result['payment'],
            'registration' => $result['registration']->load(['competitor', 'tutor', 'olimpiada', 'area', 'categoryLevel'])
        ]);
    }

    public function consultarEstado($registrationId): JsonResponse
    {
        $registration = $this->inscripcionService->obtenerEstadoInscripcion($registrationId);

        return response()->json([
            'registration' => $registration
        ]);
    }
}
