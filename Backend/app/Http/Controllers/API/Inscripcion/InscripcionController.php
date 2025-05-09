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

/**
 * @OA\Tag(
 *     name="Inscripción",
 *     description="Endpoints para el proceso de inscripción"
 * )
 */
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
     * @OA\Post(
     *     path="/api/inscripcion/olimpiada/{olimpiada}/iniciar",
     *     tags={"Inscripción"},
     *     summary="Iniciar proceso de inscripción",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="olimpiada",
     *         in="path",
     *         required=true,
     *         description="ID de la olimpiada",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Proceso iniciado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Proceso de inscripción iniciado"),
     *             @OA\Property(property="proceso", ref="#/components/schemas/RegistrationProcess")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/inscripcion/proceso/{proceso}/competidor",
     *     tags={"Inscripción"},
     *     summary="Registrar competidor en proceso",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="proceso",
     *         in="path",
     *         required=true,
     *         description="ID del proceso de inscripción",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/Competitor")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Competidor registrado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Competidor registrado"),
     *             @OA\Property(property="competitor", ref="#/components/schemas/Competitor")
     *         )
     *     )
     * )
     */
    public function registrarCompetidor(CompetidorRequest $request, RegistrationProcess $proceso)
    {
        $competidor = $this->inscripcionService->registrarCompetidor($proceso, $request->validated());
        return response()->json([
            'success' => true,
            'competidor_id' => $competidor->id,
            'mensaje' => 'Competidor registrado correctamente'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/inscripcion/proceso/{proceso}/tutor",
     *     tags={"Inscripción"},
     *     summary="Registrar tutor en proceso",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="proceso",
     *         in="path",
     *         required=true,
     *         description="ID del proceso de inscripción",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/Tutor")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tutor registrado exitosamente"
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/inscripcion/proceso/{proceso}/resumen",
     *     tags={"Inscripción"},
     *     summary="Obtener resumen de inscripción",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="proceso",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resumen obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="proceso", ref="#/components/schemas/RegistrationProcess"),
     *             @OA\Property(property="competitor", ref="#/components/schemas/Competitor"),
     *             @OA\Property(property="tutor", ref="#/components/schemas/Tutor")
     *         )
     *     )
     * )
     */
    public function obtenerResumen(RegistrationProcess $proceso)
    {
        $resumen = $this->inscripcionService->generarResumen($proceso);

        return response()->json([
            'success' => true,
            'resumen' => $resumen
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/inscripcion/proceso/{proceso}/boleta",
     *     tags={"Inscripción"},
     *     summary="Generar boleta de inscripción",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="proceso",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Boleta generada exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Boleta")
     *     )
     * )
     */
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
