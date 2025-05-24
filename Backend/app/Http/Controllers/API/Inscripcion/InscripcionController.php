<?php

namespace App\Http\Controllers\API\Inscripcion;

use App\Http\Controllers\Controller;
use App\Http\Requests\InscripcionRequest\CompetidorRequest;
use App\Http\Requests\InscripcionRequest\IniciarProcesoRequest;
use App\Http\Requests\InscripcionRequest\SeleccionAreaRequest;
use App\Http\Requests\InscripcionRequest\SeleccionNivelRequest;
use App\Http\Requests\InscripcionRequest\TutorRequest;
use App\Models\Olimpiada;

use App\Models\RegistrationProcess;
use App\Services\InscripcionService;
use App\Services\BoletaService;
use App\Enums\EstadoInscripcion;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;


class InscripcionController extends Controller
{
    protected $inscripcionService;
    protected $boletaService;

    public function __construct(InscripcionService $inscripcionService, BoletaService $boletaService)
    {
        $this->inscripcionService = $inscripcionService;
        $this->boletaService = $boletaService;
    }

    /**
     * Verifica el estado de activación de un proceso de inscripción
     *
     * @param RegistrationProcess $proceso Proceso a verificar
     * @return JsonResponse
     */
    public function verificarEstadoProceso(RegistrationProcess $proceso)
    {
        return response()->json([
            'success' => true,
            'activo' => $proceso->active,
            'estado' => $proceso->status->value,
            'estado_label' => $proceso->status->label(),
            'puede_modificar' => $proceso->active && $proceso->status->value === 'pending'
        ]);
    }
    public function iniciarProceso(IniciarProcesoRequest $request, Olimpiada $olimpiada)
    {
        $validated = $request->validated();
        $proceso = $this->inscripcionService->iniciarProceso($olimpiada, $validated['tipo'], Auth::id());
        return response()->json([
            'success' => true,
            'proceso_id' => $proceso->id,
            'mensaje' => 'Proceso de inscripción iniciado correctamente'
        ]);
    }

    public function registrarCompetidor(CompetidorRequest $request, RegistrationProcess $proceso)
    {
        $competidor = $this->inscripcionService->registrarCompetidor($proceso, $request->validated());
        return response()->json([
            'success' => true,
            'competidor_id' => $competidor->id,
            'mensaje' => 'Competidor registrado correctamente'
        ]);
    }

    public function registrarTutor(TutorRequest $request, RegistrationProcess $proceso)
    {
        $tutor = $this->inscripcionService->registrarTutor(
            $proceso,
            $request->validated(),
            $request->input('competidores_ids', []),
            Auth::id()
        );

        return response()->json([
            'success' => true,
            'tutor_id' => $tutor->id,
            'mensaje' => 'Tutor registrado correctamente'
        ]);
    }

    public function seleccionarArea(SeleccionAreaRequest $request, RegistrationProcess $proceso)
    {
        $this->inscripcionService->guardarSeleccionArea($proceso, $request->area_id);

        return response()->json([
            'success' => true,
            'mensaje' => count($request->area_id) > 1 ? 'Áreas seleccionadas correctamente' : 'Área seleccionada correctamente'
        ]);
    }

    public function seleccionarNivel(SeleccionNivelRequest $request, RegistrationProcess $proceso)
    {
        $this->inscripcionService->guardarSeleccionNivel($proceso, $request->nivel_id);

        return response()->json([
            'success' => true,
            'mensaje' => count($request->nivel_id) > 1 ? 'Niveles seleccionados correctamente' : 'Nivel seleccionado correctamente'
        ]);
    }

    public function obtenerResumen(RegistrationProcess $proceso)
    {
        $resumen = $this->inscripcionService->generarResumen($proceso);

        return response()->json([
            'success' => true,
            'resumen' => $resumen
        ]);
    }

    public function generarBoleta(RegistrationProcess $proceso)
    {
        $boleta = $this->boletaService->generarBoleta($proceso);

        return response()->json([
            'success' => true,
            'boleta_id' => $boleta->id,
            'codigo' => $boleta->numero_boleta,
            'mensaje' => 'Boleta generada correctamente. El proceso de inscripción ha sido cerrado y no se podrán realizar más cambios.'
        ]);
    }

    public function obtenerBoleta($boletaId)
    {
        $datosBoleta = $this->boletaService->obtenerDatosBoleta($boletaId);

        return response()->json([
            'success' => true,
            'boleta' => $datosBoleta
        ]);
    }

    public function actualizarEstadoProceso(Request $request, RegistrationProcess $proceso)
    {
        try {
            $request->validate([
                'nuevo_estado' => 'required|string|in:approved,rejected'
            ]);

            $nuevoEstado = EstadoInscripcion::from($request->nuevo_estado);

            // Validamos si el cambio de estado es permitido
            $this->inscripcionService->validarCambioEstado($proceso->status, $nuevoEstado);

            // Actualizamos el estado temporalmente y volvemos a cerrar el proceso
            $this->inscripcionService->actualizarEstadoProcesoTemporalmente($proceso, $nuevoEstado);

            return response()->json([
                'success' => true,
                'mensaje' => "Estado del proceso actualizado a '{$nuevoEstado->label()}'",
                'proceso' => [
                    'id' => $proceso->id,
                    'estado' => $nuevoEstado->value,
                    'estado_label' => $nuevoEstado->label(),
                    'activo' => false
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }
}
