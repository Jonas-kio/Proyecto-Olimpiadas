<?php

namespace App\Http\Controllers\API\Olimpiada;

use App\Http\Controllers\Controller;
use App\Http\Requests\Olimpiada\StoreOlimpiadaRequest;
use App\Http\Requests\Olimpiada\UpdateOlimpiadaRequest;
use App\Models\Olimpiada;
use App\Services\OlimpiadaService;
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
        $data = $request->safe()->except(['pdf_detalles', 'imagen_portada', 'areas']);


        $pdfDetalles = $request->hasFile('pdf_detalles')
            ? $request->file('pdf_detalles')
            : $request->input('ruta_pdf_detalles');

        $imagenPortada = $request->hasFile('imagen_portada')
            ? $request->file('imagen_portada')
            : $request->input('ruta_imagen_portada');


        $areas = $request->input('areas', []);
        if (is_string($areas)) {
            $areas = json_decode($areas, true) ?: [];
        }

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
        $olimpiadaActualizada = $this->olimpiadaService->updateOlimpiada(
            $olimpiada,
            $request->safe()->except(['areas', 'pdf_detalles', 'imagen_portada']),
            $request->file('pdf_detalles'),
            $request->file('imagen_portada'),
            $request->has('areas') ? $request->areas : []
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
