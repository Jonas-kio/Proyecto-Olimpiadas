<?php

namespace App\Http\Controllers\API\OCR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Boleta;
use Illuminate\Support\Facades\Storage;
use thiagoalessio\TesseractOCR\TesseractOCR;

/**
 * @OA\Tag(
 *     name="OCR",
 *     description="API Endpoints para procesamiento de comprobantes con OCR"
 * )
 */
class OcrController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/ocr/comprobante",
     *     tags={"OCR"},
     *     summary="Extraer y validar comprobante",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="imagen",
     *                     type="string",
     *                     format="binary",
     *                     description="Imagen del comprobante"
     *                 ),
     *                 @OA\Property(
     *                     property="boleta_id",
     *                     type="integer",
     *                     description="ID de la boleta a validar"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Comprobante extraído y validado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Comprobante validado correctamente"),
     *             @OA\Property(property="datos", type="object")
     *         )
     *     )
     * )
     */
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
