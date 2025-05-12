<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tutor;
use App\Services\OcrService;

class OcrController extends Controller
{
    protected $ocrService;

    public function __construct(OcrService $ocrService)
    {
        $this->ocrService = $ocrService;
    }

    public function procesarComprobante(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg',
        ]);

        $imagen = $request->file('imagen');
        $path = $imagen->storeAs('ocr-temp', $imagen->getClientOriginalName());

        $texto = $this->ocrService->extraerTexto(storage_path('app/' . $path));
        $nombrePagador = $this->ocrService->extraerNombrePagador($texto);

        if (!$nombrePagador) {
            return response()->json(['error' => 'No se encontró el nombre del pagador.'], 422);
        }

        $tutor = Tutor::whereRaw("CONCAT(nombres, ' ', apellidos) = ?", [$nombrePagador])->first();

        if (!$tutor) {
            return response()->json(['error' => 'No se encontró un tutor con ese nombre.'], 404);
        }

        return response()->json([
            'tutor_id' => $tutor->id,
            'nombres' => $tutor->nombres,
            'apellidos' => $tutor->apellidos,
            'texto_completo' => $texto
        ]);
    }
}