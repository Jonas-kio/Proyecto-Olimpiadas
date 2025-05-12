<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Boleta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\BoletaMail;
use App\Models\RegistrationProcess;
use thiagoalessio\TesseractOCR\TesseractOCR;

/**
 * @OA\Tag(
 *     name="Boletas",
 *     description="API Endpoints para gestión de boletas de pago"
 * )
 */
class BoletaPagoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/boleta/{registro}",
     *     tags={"Boletas"},
     *     summary="Generar PDF de boleta",
     *     @OA\Parameter(
     *         name="registro",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="PDF de boleta generado exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/pdf"
     *         )
     *     )
     * )
     */
    public function generarBoletaPDF(Request $request)
    {
        $data = $request->all();
        $pdf = Pdf::loadView('boleta.pdf', $data);
        return $pdf->download("boleta_{$data['numero']}.pdf");
    }

    /**
     * @OA\Post(
     *     path="/api/boleta/enviar",
     *     tags={"Boletas"},
     *     summary="Enviar boleta por correo",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"boleta_id","email"},
     *             @OA\Property(property="boleta_id", type="integer", example=1),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@ejemplo.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Boleta enviada exitosamente"
     *     )
     * )
     */
    public function enviarBoletaPorCorreo(Request $request)
    {
        $data = $request->all();
        $pdf = Pdf::loadView('boleta.pdf', $data)->output();

        Mail::to($data['correo_destino'])->send(new BoletaMail($pdf, $data['numero']));

        $registrationProcess = RegistrationProcess::find($data['registration_process_id']);
        $competitor = $registrationProcess->competitor;
        $nombreCompleto = $competitor->nombres . ' ' . $competitor->apellidos;

        Boleta::create([
            'numero' => $data['numero'],
            'fecha_emision' => now(),
            'monto_total' => $data['monto_total'],
            'correo_destino' => $data['correo_destino'],
            'estado' => 'enviado',
            'registration_process_id' => $data['registration_process_id'],
            'nombre_competidor' => $nombreCompleto,
        ]);

        return response()->json(['message' => 'Boleta enviada con éxito.']);
    }

    /**
     * @OA\Post(
     *     path="/api/boleta/ocr",
     *     tags={"Boletas"},
     *     summary="Extraer número desde OCR",
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
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Número extraído exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="numero", type="string", example="123456")
     *         )
     *     )
     * )
     */
    public function extraerNumeroDesdeOCR(Request $request)
    {
        $texto = $request->input('texto');
        preg_match('/\b\d{5,}\b/', $texto, $matches);

        if ($matches) {
            return response()->json(['numero' => $matches[0]]);
        } else {
            return response()->json(['error' => 'No se encontró un número válido'], 422);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/boleta/ocr-imagen",
     *     tags={"Boletas"},
     *     summary="Procesar imagen con OCR",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="imagen",
     *                     type="string",
     *                     format="binary",
     *                     description="Imagen a procesar"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Imagen procesada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="texto", type="string")
     *         )
     *     )
     * )
     */
    public function procesarImagenOCR(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg',
        ]);

        $imagen = $request->file('imagen');
        $path = $imagen->storeAs('ocr-temp', $imagen->getClientOriginalName());

        $texto = (new TesseractOCR(storage_path('app/' . $path)))
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
}