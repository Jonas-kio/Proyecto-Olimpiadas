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

use Illuminate\Support\Facades\Auth;


class InscripcionController extends Controller
{
    protected $inscripcionService;
    protected $boletaService;

    public function __construct(InscripcionService $inscripcionService, BoletaService $boletaService)
    {
        $this->inscripcionService = $inscripcionService;
        $this->boletaService = $boletaService;
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
            'mensaje' => 'Área seleccionada correctamente'
        ]);
    }

    public function seleccionarNivel(SeleccionNivelRequest $request, RegistrationProcess $proceso)
    {
        $this->inscripcionService->guardarSeleccionNivel($proceso, $request->nivel_id);

        return response()->json([
            'success' => true,
            'mensaje' => 'Nivel seleccionado correctamente'
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
            'mensaje' => 'Boleta generada correctamente'
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
}
