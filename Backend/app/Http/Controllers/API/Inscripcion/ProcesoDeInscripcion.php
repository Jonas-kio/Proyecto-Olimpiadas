<?php

namespace App\Http\Controllers;

use App\Http\Requests\InscripcionRequest\CompetidorRequest;
use App\Http\Requests\InscripcionRequest\IniciarProcesoRequest;
use App\Http\Requests\InscripcionRequest\SeleccionAreaRequest;
use App\Http\Requests\InscripcionRequest\SeleccionNivelRequest;
use App\Http\Requests\InscripcionRequest\TutorRequest;
use App\Models\Olimpiada;
use App\Models\ProcesoInscripcion;
use App\Services\InscripcionService;
use App\Services\BoletaService;


use Illuminate\Support\Facades\Auth;

class InscripcionController extends Controller
{
    protected $inscripcionService;
    protected $boletaService;

    public function __construct(
        InscripcionService $inscripcionService,
        //BoletaService $boletaService
    ) {
        $this->inscripcionService = $inscripcionService;
        //$this->boletaService = $boletaService;
    }

    /**
     * Inicia el proceso de inscripción para una olimpiada
     */
    public function iniciarProceso(IniciarProcesoRequest $request, Olimpiada $olimpiada)
    {
        $proceso = $this->inscripcionService->iniciarProceso($olimpiada, $request->tipo, Auth::id());
        return response()->json([
            'success' => true,
            'proceso_id' => $proceso->id,
            'mensaje' => 'Proceso de inscripción iniciado correctamente'
        ]);
    }

    /**
     * Registra un competidor en el proceso de inscripción
     */
    public function registrarCompetidor(CompetidorRequest $request, ProcesoInscripcion $proceso)
    {
        $competidor = $this->inscripcionService->registrarCompetidor($proceso, $request->validated());
        return response()->json([
            'success' => true,
            'competidor_id' => $competidor->id,
            'mensaje' => 'Competidor registrado correctamente'
        ]);
    }

    /**
     * Registra un tutor y lo asocia con uno o varios competidores
     */
    public function registrarTutor(TutorRequest $request, ProcesoInscripcion $proceso)
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

    /**
     * Guarda la selección de área
     */
    public function seleccionarArea(SeleccionAreaRequest $request, ProcesoInscripcion $proceso)
    {
        $this->inscripcionService->guardarSeleccionArea($proceso, $request->area_id);

        return response()->json([
            'success' => true,
            'mensaje' => 'Área seleccionada correctamente'
        ]);
    }

    /**
     * Guarda la selección de nivel/categoría
     */
    public function seleccionarNivel(SeleccionNivelRequest $request, ProcesoInscripcion $proceso)
    {
        $this->inscripcionService->guardarSeleccionNivel($proceso, $request->nivel_id);

        return response()->json([
            'success' => true,
            'mensaje' => 'Nivel seleccionado correctamente'
        ]);
    }

    /**
     * Obtiene el resumen del proceso de inscripción
     */
    public function obtenerResumen(ProcesoInscripcion $proceso)
    {
        $resumen = $this->inscripcionService->generarResumen($proceso);

        return response()->json([
            'success' => true,
            'resumen' => $resumen
        ]);
    }

    /**
     * Genera la boleta de pago
     */
    public function generarBoleta(ProcesoInscripcion $proceso)
    {
        $boleta = $this->boletaService->generarBoleta($proceso);

        return response()->json([
            'success' => true,
            'boleta_id' => $boleta->id,
            'codigo' => $boleta->codigo,
            'mensaje' => 'Boleta generada correctamente'
        ]);
    }

    /**
     * Obtiene los detalles de una boleta de pago
     */
    public function obtenerBoleta($boletaId)
    {
        $datosBoleta = $this->boletaService->obtenerDatosBoleta($boletaId);

        return response()->json([
            'success' => true,
            'boleta' => $datosBoleta
        ]);
    }
}
