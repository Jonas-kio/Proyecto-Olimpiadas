<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use thiagoalessio\TesseractOCR\TesseractOCR;

class OcrController extends Controller
{
    public function procesarImagen(Request $request, TesseractOCR $ocr)
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg',
        ]);

        $imagen = $request->file('imagen');
        $path = $imagen->storeAs('ocr-temp', $imagen->getClientOriginalName());

        $texto = $ocr->image(storage_path('app/' . $path))
                    ->lang('spa')
                    ->run();

        preg_match('/\b\d{5,}\b/', $texto, $matches);

        if ($matches) {
            return response()->json([
                'numero_detectado' => $matches[0],
                'texto_completo' => $texto
            ]);
        } else {
            return response()->json([
                'error' => 'No se encontró número de comprobante',
                'texto_completo' => $texto
            ], 422);
        }
    }

    public function extraerNumeroDesdeTexto(Request $request)
    {
        $request->validate([
            'texto' => 'required|string',
        ]);

        preg_match('/\b\d{5,}\b/', $request->input('texto'), $matches);

        if ($matches) {
            return response()->json(['numero' => $matches[0]]);
        } else {
            return response()->json(['error' => 'No se encontró un número válido'], 422);
        }
    }
}