<?php

namespace App\Http\Controllers\API\OCR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Boleta;
use Illuminate\Support\Facades\Storage;
use thiagoalessio\TesseractOCR\TesseractOCR;


class OcrController extends Controller
{
    public function extraerYValidarComprobante(Request $request)
    {
        // Validar que venga la imagen
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Guardar temporalmente la imagen
        $imagen = $request->file('imagen');
        $ruta = $imagen->storeAs('ocr', uniqid() . '.' . $imagen->getClientOriginalExtension(), 'public');
        $rutaCompleta = storage_path('app/public/' . $ruta);

        // Ejecutar OCR con Tesseract
        $texto = (new TesseractOCR($rutaCompleta))->lang('spa')->run();

        // Eliminar imagen después de usar
        Storage::disk('public')->delete($ruta);

        // Buscar número de boleta en el texto
        preg_match('/boleta[:\s\-]*([0-9]+)/i', $texto, $coincidencias);

        if (!isset($coincidencias[1])) {
            return response()->json([
                'valido' => false,
                'mensaje' => 'No se encontró un número de boleta en el texto.',
                'texto_detectado' => $texto,
            ], 422);
        }

        $numeroBoleta = $coincidencias[1];

        // Verificar si la boleta existe
        $boleta = Boleta::where('numero_boleta', $numeroBoleta)->first();

        if (!$boleta) {
            return response()->json([
                'valido' => false,
                'mensaje' => 'Número de boleta no válido.',
                'numero_boleta_detectado' => $numeroBoleta,
                'texto_detectado' => $texto,
            ]);
        }

        return response()->json([
            'valido' => true,
            'mensaje' => 'Boleta válida.',
            'numero_boleta' => $numeroBoleta,
            'boleta_id' => $boleta->id,
        ]);
    }
}
