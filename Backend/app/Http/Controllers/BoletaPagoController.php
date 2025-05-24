<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Boleta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\BoletaMail;
use App\Models\RegistrationProcess;
use thiagoalessio\TesseractOCR\TesseractOCR;


class BoletaPagoController extends Controller
{

    public function generarBoletaPDF(Request $request)
    {
        $data = $request->all();
        $pdf = Pdf::loadView('boleta.pdf', $data);
        return $pdf->download("boleta_{$data['numero']}.pdf");
    }

    public function enviarBoletaPorCorreo(Request $request)
    {
        try {
            $request->validate([
                'pdf' => 'required|file|mimes:pdf',
                'correo_destino' => 'required|email',
                'numero_boleta' => 'required',
                'nombre_estudiante' => 'required'
            ]);

            $pdf = $request->file('pdf');
            $correoDestino = $request->input('correo_destino');
            $numeroBoleta = $request->input('numero_boleta');
            $nombreEstudiante = $request->input('nombre_estudiante');

            // Enviar el correo
            Mail::to($correoDestino)->send(new BoletaMail($pdf->get(), $numeroBoleta));

            return response()->json([
                'success' => true,
                'message' => 'Boleta enviada con éxito.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al enviar boleta por correo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar la boleta: ' . $e->getMessage()
            ], 500);
        }
    }

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
