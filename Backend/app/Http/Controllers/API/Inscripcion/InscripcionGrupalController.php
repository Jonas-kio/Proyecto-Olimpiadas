<?php

namespace App\Http\Controllers\API\Inscripcion;

use App\Http\Controllers\Controller;
use App\Http\Requests\InscripcionRequest\AsignacionAreaNivelRequest;
use App\Http\Requests\InscripcionRequest\CargaMasivaExcelRequest;
use App\Http\Requests\InscripcionRequest\MultiplesCompetidoresRequest;
use App\Http\Requests\InscripcionRequest\MultiplesTutoresRequest;
use App\Models\GrupoCompetidores;
use App\Models\RegistrationProcess;
use App\Services\BoletaService;
use App\Services\ExcelProcessorService;
use App\Services\InscripcionGrupalService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class InscripcionGrupalController extends Controller
{
    protected $inscripcionGrupalService;
    protected $excelProcessorService;
    protected $boletaService;

    public function __construct(
        InscripcionGrupalService $inscripcionGrupalService,
        ExcelProcessorService $excelProcessorService,
        BoletaService $boletaService
    ) {
        $this->inscripcionGrupalService = $inscripcionGrupalService;
        $this->excelProcessorService = $excelProcessorService;
        $this->boletaService = $boletaService;
    }

    /**
     * Registra múltiples tutores para una inscripción grupal
     *
     * @param MultiplesTutoresRequest $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function registrarTutores(MultiplesTutoresRequest $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            $tutores = $this->inscripcionGrupalService->registrarMultiplesTutores(
                $proceso,
                $request->tutores,
                Auth::id()
            );

            return response()->json([
                'success' => true,
                'tutores' => $tutores,
                'mensaje' => 'Tutores registrados correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Procesa un archivo Excel para carga masiva de competidores
     *
     * @param CargaMasivaExcelRequest $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function cargarArchivoExcel(CargaMasivaExcelRequest $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            $resultado = $this->inscripcionGrupalService->procesarArchivoExcel($proceso, $request->file('file'));

            return response()->json([
                'success' => $resultado['success'],
                'mensaje' => $resultado['mensaje'],
                'competidores' => $resultado['success'] ? $resultado['competidores'] : null,
                'error' => !$resultado['success'] ? $resultado['error'] : null
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Descarga la plantilla de CSV para la carga masiva
     *
     * @return JsonResponse|BinaryFileResponse
     */
    public function descargarPlantilla()
    {
        try {
            $path = $this->excelProcessorService->generarPlantillaExcel();

            if (Storage::exists($path)) {
                return Storage::download($path, 'plantilla_inscripcion_grupal.csv');
            }

            return response()->json([
                'success' => false,
                'mensaje' => 'No se encontró la plantilla'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Registra múltiples competidores manualmente
     *
     * @param MultiplesCompetidoresRequest $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function registrarCompetidores(MultiplesCompetidoresRequest $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            $competidores = $this->inscripcionGrupalService->registrarMultiplesCompetidores(
                $proceso,
                $request->competidores
            );

            return response()->json([
                'success' => true,
                'competidores' => $competidores,
                'mensaje' => 'Competidores registrados correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Asigna áreas y niveles a múltiples competidores
     *
     * @param AsignacionAreaNivelRequest $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function asignarAreaNivel(AsignacionAreaNivelRequest $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            $resultado = $this->inscripcionGrupalService->asignarAreaNivelMultiples(
                $proceso,
                $request->asignaciones
            );

            return response()->json([
                'success' => true,
                'asignaciones' => $resultado,
                'mensaje' => 'Áreas y niveles asignados correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Crea un grupo de competidores para organizar la inscripción
     *
     * @param Request $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function crearGrupo(Request $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'competidores_ids' => 'nullable|array',
                'competidores_ids.*' => 'integer|exists:competitor,id'
            ]);

            $grupo = $this->inscripcionGrupalService->crearGrupoCompetidores(
                $proceso,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'grupo_id' => $grupo->id,
                'mensaje' => 'Grupo de competidores creado correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtiene los grupos de competidores de un proceso
     *
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function obtenerGrupos(RegistrationProcess $proceso): JsonResponse
    {
        try {
            $grupos = GrupoCompetidores::where('registration_process_id', $proceso->id)
                ->with('competidores')
                ->get();

            return response()->json([
                'success' => true,
                'grupos' => $grupos
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Genera resumen de inscripción grupal
     *
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function obtenerResumenGrupal(RegistrationProcess $proceso): JsonResponse
    {
        try {
            $resumen = $this->inscripcionGrupalService->generarResumenGrupal($proceso);

            return response()->json([
                'success' => true,
                'resumen' => $resumen
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Genera la boleta para la inscripción grupal
     *
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function generarBoleta(RegistrationProcess $proceso): JsonResponse
    {
        try {
            $boleta = $this->boletaService->generarBoleta($proceso);

            return response()->json([
                'success' => true,
                'boleta_id' => $boleta->id,
                'codigo' => $boleta->numero_boleta,
                'mensaje' => 'Boleta generada correctamente. El proceso de inscripción ha sido cerrado y no se podrán realizar más cambios.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);        }
    }
}
