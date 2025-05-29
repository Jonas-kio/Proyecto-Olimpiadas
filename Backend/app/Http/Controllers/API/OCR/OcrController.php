<?php

namespace App\Http\Controllers\API\OCR;

use App\Http\Controllers\Controller;
use App\Http\Requests\OCR\ProcesarComprobanteRequest;
use App\Jobs\ProcesarComprobante;
use Illuminate\Http\Request;
use App\Models\Boleta;
use App\Services\OcrService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use thiagoalessio\TesseractOCR\TesseractOCR;


class OcrController extends Controller
{

    protected $ocrService;

    public function __construct(OcrService $ocrService)
    {
        $this->ocrService = $ocrService;
    }

    public function procesarComprobante(ProcesarComprobanteRequest $request)
    {
        try {
            $textoOCR = $request->getTextoOCR();
            $procesoId = $request->registration_process_id;
            $imagen = $request->getImageFile();

            $resultado = $this->ocrService->procesarComprobante(
                $textoOCR,
                $imagen,
                $procesoId
            );

            if (!$resultado['success']) {
                return response()->json($resultado, Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return response()->json($resultado, Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al procesar el comprobante: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
