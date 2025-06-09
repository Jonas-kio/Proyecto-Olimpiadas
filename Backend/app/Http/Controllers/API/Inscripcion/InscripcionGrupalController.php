<?php

namespace App\Http\Controllers\API\Inscripcion;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
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
use Illuminate\Validation\ValidationException;

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
     * Procesa un archivo Excel para carga masiva de competidores el formato es CSV
     *
     * @param CargaMasivaExcelRequest $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function cargarArchivoExcel(CargaMasivaExcelRequest $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            // Debug información del archivo recibido
            $file = $request->file('file');

            if (!$file) {
                Log::error('No se recibió archivo en el request');
                return response()->json([
                    'success' => false,
                    'mensaje' => 'No se recibió el archivo. Verifique la configuración de PHP.'
                ], 422);
            }

            // Verificar errores de upload
            $uploadError = $file->getError();
            if ($uploadError !== UPLOAD_ERR_OK) {
                Log::error('Error de upload detectado:', [
                    'error_code' => $uploadError,
                    'error_message' => $this->getUploadErrorMessage($uploadError)
                ]);

                // Si es un error de directorio temporal, dar mensaje específico
                if ($uploadError === UPLOAD_ERR_NO_TMP_DIR || $uploadError === UPLOAD_ERR_CANT_WRITE) {
                    return response()->json([
                        'success' => false,
                        'mensaje' => 'Error de configuración del servidor: No se puede crear archivos temporales. Contacte al administrador del sistema.'
                    ], 500);
                }
            }

            Log::info('Archivo CSV recibido:', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension(),
                'path' => $file->getRealPath(),
                'upload_error' => $uploadError
            ]);

            $resultado = $this->inscripcionGrupalService->procesarArchivoExcel($proceso, $file);

            return response()->json([
                'success' => $resultado['success'],
                'mensaje' => $resultado['mensaje'],
                'competidores' => $resultado['success'] ? $resultado['competidores'] : null,
                'error' => !$resultado['success'] ? $resultado['error'] : null
            ]);
        } catch (Exception $e) {
            Log::error('Error al procesar archivo CSV:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    private function getUploadErrorMessage($errorCode)
    {
        switch ($errorCode) {
            case UPLOAD_ERR_OK:
                return 'No error';
            case UPLOAD_ERR_INI_SIZE:
                return 'File too large (ini_size)';
            case UPLOAD_ERR_FORM_SIZE:
                return 'File too large (form_size)';
            case UPLOAD_ERR_PARTIAL:
                return 'File partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'No temporary directory';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Cannot write to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'Upload stopped by extension';
            default:
                return 'Unknown error';
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
            // Generar plantilla CSV en memoria para evitar problemas de archivos temporales
            $csvContent = $this->excelProcessorService->generarPlantillaCSVEnMemoria();

            // Retornar directamente el contenido como descarga sin crear archivo temporal
            return response($csvContent)
                ->header('Content-Type', 'text/csv; charset=utf-8')
                ->header('Content-Disposition', 'attachment; filename="plantilla_inscripcion_grupal.csv"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (Exception $e) {
            Log::error('Error al generar plantilla CSV:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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
            ], 422);
        }
    }

    /**
     * Obtener datos completos de una boleta grupal
     */
    public function obtenerBoleta($procesoId, $boletaId): JsonResponse
    {
        try {
            $datosBoleta = $this->boletaService->obtenerDatosBoleta($procesoId, $boletaId);

            return response()->json([
                'success' => true,
                'boleta' => $datosBoleta
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verifica si los competidores ya existen en la base de datos
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verificarCompetidoresExistentes(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'competidores' => 'required|array|min:1',
                'competidores.*.documento_identidad' => 'required|string|max:20',
                'competidores.*.correo_electronico' => 'required|email|max:100',
                'competidores.*.nombres' => 'nullable|string|max:255',
                'competidores.*.apellidos' => 'nullable|string|max:255'
            ]);

            $resultado = $this->inscripcionGrupalService->verificarCompetidoresExistentes(
                $request->competidores
            );

            return response()->json([
                'success' => true,
                'resultado' => $resultado,
                'mensaje' => 'Verificación completada'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Registra competidores omitiendo los duplicados
     *
     * @param Request $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function registrarCompetidoresSinDuplicados(Request $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            $request->validate([
                'competidores' => 'required|array|min:1',
                'indices_omitir' => 'nullable|array',
                'indices_omitir.*' => 'integer'
            ]);

            $competidores = $this->inscripcionGrupalService->registrarCompetidoresSinDuplicados(
                $proceso,
                $request->competidores,
                $request->indices_omitir ?? []
            );

            return response()->json([
                'success' => true,
                'competidores' => $competidores,
                'total_registrados' => count($competidores),
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
     * Asocia competidores existentes a un proceso
     *
     * @param Request $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function asociarCompetidoresExistentes(Request $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            $request->validate([
                'competidores_ids' => 'required|array|min:1',
                'competidores_ids.*' => 'integer|exists:competitor,id'
            ]);

            $competidores = $this->inscripcionGrupalService->asociarCompetidoresExistentes(
                $proceso,
                $request->competidores_ids
            );

            return response()->json([
                'success' => true,
                'competidores' => $competidores,
                'total_asociados' => count($competidores),
                'mensaje' => 'Competidores asociados correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Procesa contenido CSV enviado como texto (alternativa al upload de archivos)
     *
     * @param Request $request
     * @param RegistrationProcess $proceso
     * @return JsonResponse
     */
    public function procesarCSVTexto(Request $request, RegistrationProcess $proceso): JsonResponse
    {
        try {
            // Validar que se envíe el contenido CSV
            $request->validate([
                'csv_content' => 'required|string',
                'filename' => 'required|string'
            ]);

            $csvContent = $request->input('csv_content');
            $filename = $request->input('filename');

            Log::info('Procesando CSV como texto:', [
                'proceso_id' => $proceso->id,
                'filename' => $filename,
                'content_length' => strlen($csvContent)
            ]);

            // Crear archivo temporal con el contenido
            $tempFile = tempnam(sys_get_temp_dir(), 'csv_') . '.csv';
            file_put_contents($tempFile, $csvContent);

            // Simular un UploadedFile
            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $tempFile,
                $filename,
                'text/csv',
                null,
                true // test mode para evitar validaciones de upload
            );

            // Guardar archivo usando el servicio existente
            $fileCarga = $this->excelProcessorService->guardarArchivo($uploadedFile, $proceso);

            // Procesar archivo
            $resultado = $this->excelProcessorService->procesarArchivo($fileCarga);

            // Limpiar archivo temporal
            unlink($tempFile);

            if ($resultado['success']) {
                return response()->json([
                    'success' => true,
                    'mensaje' => $resultado['mensaje'],
                    'competidores_creados' => $resultado['competidores_creados'],
                    'competidores' => $resultado['competidores']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'mensaje' => $resultado['mensaje'],
                    'error' => $resultado['error'] ?? 'Error desconocido'
                ], 422);
            }

        } catch (ValidationException $e) {
            Log::error('Error de validación en procesarCSVTexto:', [
                'errors' => $e->errors(),
                'proceso_id' => $proceso->id
            ]);

            return response()->json([
                'success' => false,
                'mensaje' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            Log::error('Error al procesar CSV como texto:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'proceso_id' => $proceso->id
            ]);

            return response()->json([
                'success' => false,
                'mensaje' => 'Error al procesar el archivo CSV',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtiene datos específicos de boleta para inscripciones grupales
     *
     * @param $procesoId
     * @param $boletaId
     * @return JsonResponse
     */
    public function obtenerBoletaGrupal($procesoId, $boletaId)
    {
        try {
            // Obtener datos básicos de la boleta usando el servicio original
            $respuesta = $this->boletaService->obtenerDatosBoleta($procesoId, $boletaId);
            $datosBasicos = $respuesta['data'];

            // Para inscripciones grupales, obtener competidores únicos y limpios
            $proceso = RegistrationProcess::with(['detalles.competidor.tutores'])->findOrFail($procesoId);

            if ($proceso->type === 'grupal') {
                // Obtener competidores únicos
                $competidores = $proceso->detalles->map(function($detalle) {
                    return $detalle->competidor;
                })->unique('id')->values();

                // Formatear competidores para evitar duplicados
                $competidoresLimpios = $competidores->map(function($competidor) {
                    return [
                        'id' => $competidor->id,
                        'nombres' => $competidor->nombres,
                        'apellidos' => $competidor->apellidos,
                        'documento_identidad' => (string) $competidor->documento_identidad,
                        'correo_electronico' => $competidor->correo_electronico,
                        'colegio' => $competidor->colegio,
                        'curso' => $competidor->curso,
                        'tutores' => $competidor->tutores->map(function($tutor) {
                            return [
                                'nombres' => $tutor->nombres,
                                'apellidos' => $tutor->apellidos,
                                'correo_electronico' => $tutor->correo_electronico,
                                'telefono' => $tutor->telefono
                            ];
                        })->toArray()
                    ];
                })->toArray();

                $datosBasicos['competidores'] = $competidoresLimpios;
                $datosBasicos['cantidad_competidores'] = count($competidoresLimpios);
            }

            return response()->json([
                'success' => true,
                'data' => $datosBasicos
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 422);
        }
    }
}
