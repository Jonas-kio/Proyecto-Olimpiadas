<?php

namespace App\Http\Controllers\API\Olimpiada;

use App\Http\Controllers\Controller;
use App\Http\Requests\Olimpiada\StoreOlimpiadaRequest;
use App\Http\Requests\Olimpiada\UpdateOlimpiadaRequest;
use App\Models\Olimpiada;
use App\Services\OlimpiadaService;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class OlimpiadaController extends Controller
{
    protected $olimpiadaService;

    public function __construct(OlimpiadaService $olimpiadaService)
    {
        $this->olimpiadaService = $olimpiadaService;
    }

    public function index(): JsonResponse
    {
        $olimpiadas = $this->olimpiadaService->getPaginatedOlimpiadas();

        return response()->json([
            'status' => 'success',
            'data' => $olimpiadas
        ]);
    }

    public function store(StoreOlimpiadaRequest $request): JsonResponse
    {
        try {
            // Depuración detallada
            Log::info('Request data:', $request->all());
            Log::info('Files present:', [
                'hasFiles' => $request->hasFile('pdf_detalles') || $request->hasFile('imagen_portada'),
                'pdf_detalles' => $request->hasFile('pdf_detalles') ? 'Present' : 'Not present',
                'imagen_portada' => $request->hasFile('imagen_portada') ? 'Present' : 'Not present'
            ]);

            // Depurar las áreas
            Log::info('Areas data:', [
                'raw' => $request->input('areas'),
                'type' => gettype($request->input('areas')),
            ]);

            $data = $request->safe()->except(['pdf_detalles', 'imagen_portada', 'areas']);

            $pdfDetalles = $request->hasFile('pdf_detalles')
                ? $request->file('pdf_detalles')
                : null;

            $imagenPortada = $request->hasFile('imagen_portada')
                ? $request->file('imagen_portada')
                : null;

            $areas = $request->input('areas', []);
            if (is_string($areas)) {
                // Intenta diferentes formatos de conversión
                $areas = json_decode($areas, true);
                if ($areas === null) {
                    $areas = array_map('trim', explode(',', str_replace(['[', ']'], '', $areas)));
                    $areas = array_map('intval', $areas);
                }
            }

            // Registra los datos procesados
            Log::info('Processed data:', [
                'data' => $data,
                'areas' => $areas,
                'hasPdf' => $pdfDetalles !== null,
                'hasImage' => $imagenPortada !== null
            ]);

            $olimpiada = $this->olimpiadaService->createOlimpiada(
                $data,
                $pdfDetalles,
                $imagenPortada,
                $areas
            );

            return response()->json([
                'message' => 'Olimpiada creada exitosamente',
                'data' => $olimpiada
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating olympiad: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'error' => 'Error al crear la olimpiada',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function show(Olimpiada $olimpiada): JsonResponse
    {
        // Explicitly load areas
        $olimpiada->load('areas');

        return response()->json([
            'status' => 'success',
            'data' => $olimpiada
        ]);
    }

    public function update(UpdateOlimpiadaRequest $request, Olimpiada $olimpiada): JsonResponse
    {
        $areas = $request->input('areas', null);
        if (is_string($areas)) {
            $areas = json_decode($areas, true);
        }

        $olimpiadaActualizada = $this->olimpiadaService->updateOlimpiada(
            $olimpiada,
            $request->safe()->except(['areas', 'pdf_detalles', 'imagen_portada']),
            $request->hasFile('pdf_detalles') ? $request->file('pdf_detalles') : null,
            $request->hasFile('imagen_portada') ? $request->file('imagen_portada') : null,
            $areas
        );

        return response()->json([
            'message' => 'Olimpiada actualizada exitosamente',
            'data' => $olimpiadaActualizada
        ]);
    }

    public function destroy(Olimpiada $olimpiada): JsonResponse
    {
        $this->olimpiadaService->deleteOlimpiada($olimpiada);

        return response()->json([
            'message' => 'Olimpiada eliminada exitosamente'
        ], 204);
    }
}
