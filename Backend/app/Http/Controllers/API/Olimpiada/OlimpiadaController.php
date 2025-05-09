<?php

namespace App\Http\Controllers\API\Olimpiada;

use App\Http\Controllers\Controller;
use App\Http\Requests\Olimpiada\StoreOlimpiadaRequest;
use App\Http\Requests\Olimpiada\UpdateOlimpiadaRequest;
use App\Models\Olimpiada;
use App\Services\OlimpiadaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Olimpiadas",
 *     description="API Endpoints para gestión de olimpiadas"
 * )
 */

/**
 * @OA\Tag(
 *     name="Olimpiadas - Usuario",
 *     description="API Endpoints para gestión de olimpiadas (usuarios normales)"
 * )
 */
class OlimpiadaController extends Controller
{
    private OlimpiadaService $olimpiadaService;

    public function __construct(OlimpiadaService $olimpiadaService)
    {
        $this->olimpiadaService = $olimpiadaService;
    }

    /**
     * @OA\Get(
     *     path="/api/olimpiadas",
     *     tags={"Olimpiadas"},
     *     summary="Obtener lista de olimpiadas",
     *     @OA\Response(
     *         response=200,
     *         description="Lista de olimpiadas obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Operación exitosa"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="olimpiadas",
     *                     type="array",
     *                     @OA\Items(ref="#/components/schemas/Olimpiada")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        try {
            $olimpiadas = $this->olimpiadaService->getPaginatedOlimpiadas();

            return $this->successResponse([
                'olimpiadas' => $olimpiadas
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las olimpiadas', $e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/user/olimpiadas",
     *     tags={"Olimpiadas - Usuario"},
     *     summary="Listar olimpiadas disponibles para usuario",
     *     description="Obtiene la lista de olimpiadas disponibles para usuarios normales",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de olimpiadas disponibles",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Operación exitosa"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="olimpiadas",
     *                     type="array",
     *                     @OA\Items(ref="#/components/schemas/Olimpiada")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function indexUser(): JsonResponse
    {
        try {
            $olimpiadas = $this->olimpiadaService->getPaginatedOlimpiadas();

            return $this->successResponse([
                'olimpiadas' => $olimpiadas
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las olimpiadas', $e);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/olimpiadas",
     *     tags={"Olimpiadas"},
     *     summary="Crear nueva olimpiada",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"nombre","descripcion","fecha_inicio","fecha_fin","cupo_minimo","modalidad"},
     *                 @OA\Property(property="nombre", type="string", example="Olimpiada de Matemáticas 2025"),
     *                 @OA\Property(property="descripcion", type="string", example="Competencia nacional de matemáticas"),
     *                 @OA\Property(property="fecha_inicio", type="string", format="date", example="2025-06-01"),
     *                 @OA\Property(property="fecha_fin", type="string", format="date", example="2025-06-30"),
     *                 @OA\Property(property="cupo_minimo", type="integer", example=50),
     *                 @OA\Property(property="modalidad", type="string", example="Presencial"),
     *                 @OA\Property(property="pdf_detalles", type="string", format="binary"),
     *                 @OA\Property(property="imagen_portada", type="string", format="binary"),
     *                 @OA\Property(property="areas", type="array", @OA\Items(type="integer"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Olimpiada creada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Olimpiada creada exitosamente"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="olimpiada", ref="#/components/schemas/Olimpiada")
     *             )
     *         )
     *     )
     * )
     */
    public function store(StoreOlimpiadaRequest $request): JsonResponse
    {
        try {
            $fechaInicio = Carbon::parse($request->input('fecha_inicio'));
            $fechaFin = Carbon::parse($request->input('fecha_fin'));

            $this->validarFechas($fechaInicio, $fechaFin);

            $data = $this->prepareStoreData($request);

            $olimpiada = $this->olimpiadaService->createOlimpiada(
                $data,
                $request->file('pdf_detalles'),
                $request->file('imagen_portada'),
                $request->input('areas', [])
            );

            return $this->successResponse([
                'olimpiada' => $olimpiada
            ], 'Olimpiada creada exitosamente', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al crear la olimpiada', $e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/olimpiadas/{olimpiada}",
     *     tags={"Olimpiadas"},
     *     summary="Obtener detalles de una olimpiada",
     *     @OA\Parameter(
     *         name="olimpiada",
     *         in="path",
     *         required=true,
     *         description="ID de la olimpiada",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalles de la olimpiada obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Operación exitosa"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="olimpiada", ref="#/components/schemas/Olimpiada")
     *             )
     *         )
     *     )
     * )
     */
    public function show(Olimpiada $olimpiada): JsonResponse
    {
        try {
            $olimpiada->load('areas');
            return $this->successResponse([
                'olimpiada' => $olimpiada
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener la olimpiada', $e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/user/olimpiadas/{olimpiada}",
     *     tags={"Olimpiadas - Usuario"},
     *     summary="Ver detalles de una olimpiada como usuario",
     *     description="Obtiene los detalles de una olimpiada específica para usuarios normales",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="olimpiada",
     *         in="path",
     *         required=true,
     *         description="ID de la olimpiada",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalles de la olimpiada obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Operación exitosa"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="olimpiada", ref="#/components/schemas/Olimpiada")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="No autorizado para ver esta olimpiada",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="No tienes acceso a esta olimpiada")
     *         )
     *     )
     * )
     */
    public function showUser(Olimpiada $olimpiada): JsonResponse
    {
        try {
            $olimpiada->load('areas');
            return $this->successResponse([
                'olimpiada' => $olimpiada
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener la olimpiada', $e);
        }
    }

    public function update(UpdateOlimpiadaRequest $request, Olimpiada $olimpiada): JsonResponse
    {
        try {
            $parsedData = $this->parseMultipartFormData($request);
            $updateData = $this->prepareUpdateData($parsedData['data']);

            $hoy = Carbon::today();
            $fechaInicio = Carbon::parse($updateData['fecha_inicio'] ?? $olimpiada->fecha_inicio);
            $fechaFin = Carbon::parse($updateData['fecha_fin'] ?? $olimpiada->fecha_fin);

            $this->validarFechas($fechaInicio, $fechaFin);


            $olimpiadaActualizada = $this->olimpiadaService->updateOlimpiada(
                $olimpiada,
                $updateData,
                $this->getUploadedFile($parsedData['files'], 'pdf_detalles'),
                $this->getUploadedFile($parsedData['files'], 'imagen_portada'),
                $this->parseAreas($parsedData['data']['areas'] ?? null)
            );

            return $this->successResponse([
                'olimpiada' => $olimpiadaActualizada->fresh()
            ], 'Olimpiada actualizada exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar la olimpiada', $e);
        }
    }

    private function validarFechas(Carbon $fechaInicio, Carbon $fechaFin): void
    {
        $hoy = Carbon::today();

        if ($fechaInicio->lt($hoy)) {
            throw new \Exception('La fecha de inicio no puede ser una fecha pasada.');
        }

        if ($fechaFin->lt($hoy)) {
            throw new \Exception('La fecha de fin no puede ser una fecha pasada.');
        }
        $diferenciaDias = $fechaInicio->diffInDays($fechaFin);
        if ($diferenciaDias < 10) {
            throw new \Exception('La fecha de fin debe ser al menos 10 días posterior a la fecha de inicio.');
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/olimpiadas/{olimpiada}",
     *     tags={"Olimpiadas"},
     *     summary="Eliminar una olimpiada",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="olimpiada",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la olimpiada a eliminar"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Olimpiada eliminada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Olimpiada eliminada exitosamente")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Olimpiada no encontrada"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="No autorizado para eliminar olimpiadas"
     *     )
     * )
     */
    public function destroy(Olimpiada $olimpiada): JsonResponse
    {
        try {
            $this->olimpiadaService->deleteOlimpiada($olimpiada);

            return $this->successResponse([
                'id' => $olimpiada->id,
                'nombre' => $olimpiada->nombre
            ], 'Olimpiada eliminada exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar la olimpiada', $e);
        }
    }

    private function parseMultipartFormData(Request $request): array
    {
        Log::info('Request headers:', $request->headers->all());
        Log::info('Request content type:', [$request->header('Content-Type')]);
        Log::info('Request all files:', $request->allFiles());

        $rawContent = file_get_contents('php://input');
        $boundary = substr($rawContent, 0, strpos($rawContent, "\r\n"));
        $parts = array_slice(explode($boundary, $rawContent), 1);
        $data = [];
        $files = [];

        foreach ($parts as $part) {
            if ($part == "--\r\n") break;

            $part = ltrim($part, "\r\n");
            list($raw_headers, $body) = explode("\r\n\r\n", $part, 2);

            $headers = $this->parseHeaders($raw_headers);

            if (isset($headers['content-disposition'])) {
                $this->processPart($headers['content-disposition'], $body, $data, $files);
            }
        }

        Log::info('Parsed form data:', $data);
        Log::info('Files detected:', array_keys($files));

        return ['data' => $data, 'files' => $files];
    }

    private function parseHeaders(string $rawHeaders): array
    {
        $headers = [];
        foreach (explode("\r\n", $rawHeaders) as $header) {
            list($name, $value) = explode(':', $header);
            $headers[strtolower($name)] = ltrim($value, ' ');
        }
        return $headers;
    }

    private function processPart(string $contentDisposition, string $body, array &$data, array &$files): void
    {
        preg_match('/^(.+); *name="([^"]+)"(; *filename="([^"]+)")?/', $contentDisposition, $matches);
        list(, $type, $name) = $matches;

        if (isset($matches[4])) {
            $filename = $matches[4];
            Log::info('Archivo detectado:', [
                'name' => $name,
                'filename' => $filename
            ]);
            $files[$name] = [
                'name' => $filename,
                'content' => $body
            ];
        } else {
            $data[$name] = $body;
        }
    }

    private function getUploadedFile(array $files, string $key): ?\Illuminate\Http\UploadedFile
    {
        if (!isset($files[$key])) {
            return null;
        }

        $fileInfo = $files[$key];
        $tempPath = tempnam(sys_get_temp_dir(), substr($fileInfo['name'], 0, 3) . '_');
        file_put_contents($tempPath, $fileInfo['content']);

        return new \Illuminate\Http\UploadedFile(
            $tempPath,
            $fileInfo['name'],
            mime_content_type($tempPath),
            null,
            true
        );
    }

    private function prepareStoreData(StoreOlimpiadaRequest $request): array
    {
        return $request->safe()->except(['pdf_detalles', 'imagen_portada', 'areas']);
    }

    private function prepareUpdateData(array $data): array
    {
        $updateData = [];

        if (isset($data['nombre'])) $updateData['nombre'] = trim($data['nombre']);
        if (isset($data['descripcion'])) $updateData['descripcion'] = trim($data['descripcion']);
        if (isset($data['fecha_inicio'])) $updateData['fecha_inicio'] = trim($data['fecha_inicio']);
        if (isset($data['fecha_fin'])) $updateData['fecha_fin'] = trim($data['fecha_fin']);
        if (isset($data['cupo_minimo'])) $updateData['cupo_minimo'] = (int)trim($data['cupo_minimo']);
        if (isset($data['modalidad'])) {
            $modalidad = trim($data['modalidad']);
            $updateData['modalidad'] = ucfirst(strtolower($modalidad));
        }
        if (isset($data['activo'])) {
            $updateData['activo'] = in_array(strtolower(trim($data['activo'])), ['true', '1', 'yes', 'si', 't']);
        }

        return $updateData;
    }

    private function parseAreas(?string $areasInput): ?array
    {
        if (!$areasInput) {
            return null;
        }

        $areas = json_decode($areasInput, true);
        if ($areas === null) {
            $areas = array_map('trim', explode(',', str_replace(['[', ']'], '', $areasInput)));
        }
        return array_map('intval', array_filter($areas));
    }

    private function successResponse(array $data, string $message = 'Operación exitosa', int $status = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $status);
    }

    private function errorResponse(string $message, \Exception $e, int $status = 500): JsonResponse
    {
        Log::error($message . ': ' . $e->getMessage());
        Log::error($e->getTraceAsString());

        return response()->json([
            'status' => 'error',
            'message' => $message,
            'error' => $e->getMessage()
        ], $status);
    }
}
