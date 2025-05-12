<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OcrService;

class OcrController extends Controller
{
    protected $ocrService;

    public function __construct(OcrService $ocrService)
    {
        $this->ocrService = $ocrService;
    }

    public function procesarImagenOCR(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg',
        ]);

        $imagen = $request->file('imagen');
        $path = $imagen->storeAs('ocr-temp', $imagen->getClientOriginalName());

        $resultado = $this->ocrService->procesarImagen(storage_path('app/' . $path));

        if ($resultado['numero_detectado']) {
            return response()->json($resultado);
        } else {
            return response()->json([
                'error' => 'No se encontró número de comprobante',
                'texto_completo' => $resultado['texto_completo']
            ], 422);
        }
    }
}