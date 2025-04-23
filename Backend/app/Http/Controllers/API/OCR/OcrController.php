<?php

namespace App\Http\Controllers\API\OCR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RegistrationProcess;


class OcrController extends Controller
{
    public function validarComprobante(Request $request)
    {
        $texto = $request->input('texto');

        if (!$texto) {
            return response()->json(['error' => 'Texto OCR no proporcionado.'], 400);
        }

        // Buscar número de boleta en el texto
        preg_match('/boleta[:\s\-]*([0-9]+)/i', $texto, $coincidencias);

        if (!isset($coincidencias[1])) {
            return response()->json(['error' => 'No se encontró un número de boleta en el texto.'], 422);
        }

        $numeroBoleta = $coincidencias[1];

        // Buscar si el número existe en la base de datos
        $registro = RegistrationProcess::where('codigo_boleta', $numeroBoleta)->first();

        if (!$registro) {
            return response()->json(['valido' => false, 'mensaje' => 'Número de boleta no válido.']);
        }

        return response()->json([
            'valido' => true,
            'mensaje' => 'Boleta válida.',
            'numero_boleta' => $numeroBoleta,
            'registro_id' => $registro->id,
        ]);
    }
}