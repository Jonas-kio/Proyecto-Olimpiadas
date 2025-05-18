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
        try {
            // Validar datos recibidos
            $request->validate([
                'pdf' => 'required|file|mimes:pdf',
                'correo_destino' => 'required|email',
                'numero_boleta' => 'required',
                'nombre_estudiante' => 'required',
                'registration_process_id' => 'required|integer',
                'monto_total' => 'required|numeric',
            ]);
            
            $pdf = $request->file('pdf');
            $correoDestino = $request->input('correo_destino');
            $numeroBoleta = $request->input('numero_boleta');
            $nombreEstudiante = $request->input('nombre_estudiante');
            $registrationProcessId = $request->input('registration_process_id');
            $montoTotal = $request->input('monto_total');
            
            // Buscar el proceso de registro y obtener el competidor
            $registrationProcess = RegistrationProcess::find($registrationProcessId);
            if (!$registrationProcess) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proceso de registro no encontrado.'
                ], 404);
            }
            
            $competitor = $registrationProcess->competitor;
            $nombreCompleto = $competitor->nombres . ' ' . $competitor->apellidos;
            
            // Enviar el correo
            Mail::to($correoDestino)->send(new BoletaMail($pdf->get(), $numeroBoleta));
            
            // Registrar la boleta en la base de datos
            Boleta::create([
                'numero' => $numeroBoleta,
                'fecha_emision' => now(),
                'monto_total' => $montoTotal,
                'correo_destino' => $correoDestino,
                'estado' => 'enviado',
                'registration_process_id' => $registrationProcessId,
                'nombre_competidor' => $nombreCompleto,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Boleta enviada y registrada con éxito.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al enviar/registrar boleta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar o registrar la boleta: ' . $e->getMessage()
            ], 500);
        }
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