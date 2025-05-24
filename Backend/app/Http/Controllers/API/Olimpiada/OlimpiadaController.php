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


class OlimpiadaController extends Controller
{
    private OlimpiadaService $olimpiadaService;

    public function __construct(OlimpiadaService $olimpiadaService)
    {
        $this->olimpiadaService = $olimpiadaService;
    }

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

    public function store(StoreOlimpiadaRequest $request): JsonResponse
    {
        try {
            Log::info('store: Iniciando creación de olimpiada', [
                'all_data' => $request->all(),
                'validated' => $request->validated()
            ]);

            $fechaInicio = Carbon::parse($request->input('fecha_inicio'));
            $fechaFin = Carbon::parse($request->input('fecha_fin'));

            $this->validarFechas($fechaInicio, $fechaFin);

            $data = $this->prepareStoreData($request);
            Log::info('store: data preparada', ['data' => $data]);

            // Obtener las áreas directamente de la validación para evitar problemas de parseo
            $areas = $request->validated()['areas'];
            Log::info('store: areas obtenidas de validación', ['areas' => $areas]);

            // Verificar cómo vienen las condiciones en la solicitud
            Log::info('store: examinando condiciones antes de procesar', [
                'condiciones_raw' => $request->input('condiciones'),
                'condiciones_tipo' => gettype($request->input('condiciones')),
                'condiciones_en_validated' => array_key_exists('condiciones', $request->validated()) ? $request->validated()['condiciones'] : 'no existe'
            ]);

            // Usar condiciones de la validación si existen, o procesarlas directamente
            $condiciones = array_key_exists('condiciones', $request->validated())
                ? $this->parseCondiciones($request->validated()['condiciones'])
                : $this->parseCondiciones($request->input('condiciones'));

            Log::info('store: condiciones parseadas', ['condiciones' => $condiciones]);

            $olimpiada = $this->olimpiadaService->createOlimpiada(
                $data,
                $request->file('pdf_detalles'),
                $request->file('imagen_portada'),
                $areas,
                $condiciones
            );

            return $this->successResponse([
                'olimpiada' => $olimpiada
            ], 'Olimpiada creada exitosamente', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al crear la olimpiada', $e);
        }
    }

    public function show(Olimpiada $olimpiada): JsonResponse
    {
        try {
            $olimpiada->load('areas', 'conditions.area');
            
            // Agregar datos formateados con las áreas y sus condiciones
            $areasConCondiciones = $olimpiada->areas->map(function ($area) use ($olimpiada) {
                $condicion = $olimpiada->conditions->where('area_id', $area->id)->first();
                
                return [
                    'id' => $area->id,
                    'nombre' => $area->nombre,
                    'descripcion' => $area->descripcion,
                    'pivot' => $area->pivot,
                    'condicion' => $condicion ? [
                        'id' => $condicion->id,
                        'nivel_unico' => $condicion->nivel_unico,
                        'area_exclusiva' => $condicion->area_exclusiva
                    ] : null
                ];
            });
            
            Log::info('show: Áreas con condiciones', [
                'olimpiada_id' => $olimpiada->id, 
                'areas_count' => $areasConCondiciones->count(),
                'conditions_count' => $olimpiada->conditions->count()
            ]);
            
            return $this->successResponse([
                'olimpiada' => $olimpiada,
                'areas_con_condiciones' => $areasConCondiciones
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener la olimpiada', $e);
        }
    }

    public function showUser(Olimpiada $olimpiada): JsonResponse
    {
        try {
            $olimpiada->load('areas', 'conditions.area');
            
            // Agregar datos formateados con las áreas y sus condiciones
            $areasConCondiciones = $olimpiada->areas->map(function ($area) use ($olimpiada) {
                $condicion = $olimpiada->conditions->where('area_id', $area->id)->first();
                
                return [
                    'id' => $area->id,
                    'nombre' => $area->nombre,
                    'descripcion' => $area->descripcion,
                    'pivot' => $area->pivot,
                    'condicion' => $condicion ? [
                        'id' => $condicion->id,
                        'nivel_unico' => $condicion->nivel_unico,
                        'area_exclusiva' => $condicion->area_exclusiva
                    ] : null
                ];
            });
            
            Log::info('showUser: Áreas con condiciones', [
                'olimpiada_id' => $olimpiada->id, 
                'areas_count' => $areasConCondiciones->count(),
                'conditions_count' => $olimpiada->conditions->count()
            ]);
            
            return $this->successResponse([
                'olimpiada' => $olimpiada,
                'areas_con_condiciones' => $areasConCondiciones
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
                $this->parseAreas($parsedData['data']['areas'] ?? null),
                $this->parseCondiciones($parsedData['data']['condiciones'] ?? null)
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
        // Agregamos logs para ver los datos validados
        Log::info('prepareStoreData: datos validados', [
            'validated' => $request->validated(),
            'safe' => $request->safe()->all()
        ]);

        return $request->safe()->except(['pdf_detalles', 'imagen_portada', 'areas', 'condiciones']);
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
            Log::info('parseAreas: areasInput es nulo o vacío');
            return [];
        }

        Log::info('parseAreas: procesando entrada', ['areasInput' => $areasInput]);

        $areas = json_decode($areasInput, true);
        if ($areas === null) {
            // Si no es JSON, intentamos procesar como string separado por comas
            $areas = array_map('trim', explode(',', str_replace(['[', ']'], '', $areasInput)));
            Log::info('parseAreas: procesado como string separado por comas', ['areas' => $areas]);
        } else {
            Log::info('parseAreas: procesado como JSON', ['areas' => $areas]);
        }

        $result = array_map('intval', array_filter($areas));
        Log::info('parseAreas: resultado final', ['result' => $result]);

        return $result;
    }

    private function parseCondiciones($condicionesInput): ?array
    {
        Log::info('parseCondiciones: iniciando procesamiento', [
            'condicionesInput' => $condicionesInput,
            'tipo' => gettype($condicionesInput)
        ]);

        if (!$condicionesInput) {
            Log::info('parseCondiciones: input vacío o nulo, retornando null');
            return null;
        }

        $condiciones = $condicionesInput;

        // Si es un string, intentar parsearlo como JSON
        if (is_string($condicionesInput)) {
            Log::info('parseCondiciones: procesando input como string');
            $condiciones = json_decode($condicionesInput, true);

            if ($condiciones === null) {
                Log::warning('parseCondiciones: error al decodificar JSON', [
                    'json_error' => json_last_error_msg()
                ]);
                return null;
            }

            Log::info('parseCondiciones: JSON decodificado exitosamente', [
                'condiciones_decodificadas' => $condiciones
            ]);
        } else if (!is_array($condicionesInput)) {
            Log::warning('parseCondiciones: tipo de input no soportado', [
                'tipo' => gettype($condicionesInput)
            ]);
            return null;
        } else {
            Log::info('parseCondiciones: input ya es un array', [
                'condiciones' => $condiciones
            ]);
        }

        $resultado = collect($condiciones)->map(function ($condicion) {
            return [
                'area_id' => (int)$condicion['area_id'],
                'nivel_unico' => (bool)($condicion['nivel_unico'] ?? false),
                'area_exclusiva' => (bool)($condicion['area_exclusiva'] ?? false)
            ];
        })->all();

        Log::info('parseCondiciones: procesamiento completado', [
            'resultado' => $resultado
        ]);

        return $resultado;
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
