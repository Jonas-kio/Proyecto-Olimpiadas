<?php

namespace App\Http\Controllers\API\Olimpiada;

use App\Http\Controllers\Controller;
use App\Http\Requests\Olimpiada\StoreOlimpiadaRequest;
use App\Http\Requests\Olimpiada\UpdateOlimpiadaRequest;
use App\Models\Olimpiada;
use App\Services\OlimpiadaService;
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

    public function store(StoreOlimpiadaRequest $request): JsonResponse
    {
        try {
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

    public function update(UpdateOlimpiadaRequest $request, Olimpiada $olimpiada): JsonResponse
    {
        try {
            $parsedData = $this->parseMultipartFormData($request);
            $updateData = $this->prepareUpdateData($parsedData['data']);
            
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