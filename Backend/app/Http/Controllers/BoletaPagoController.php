<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Boleta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\BoletaMail;
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
        $data = $request->all();
        $pdf = Pdf::loadView('boleta.pdf', $data)->output();

        Mail::to($data['correo_destino'])->send(new BoletaMail($pdf, $data['numero']));

        Boleta::create([
            'numero' => $data['numero'],
            'fecha_emision' => now(),
            'monto_total' => $data['monto_total'],
            'correo_destino' => $data['correo_destino'],
            'estado' => 'enviado',
            'registration_process_id' => $data['registration_process_id']
        ]);

        return response()->json(['message' => 'Boleta enviada con éxito.']);
    }

    public function extraerNumeroDesdeOCR(Request $request)
    {
        $texto = $request->input('texto');
        preg_match('/\\b\\d{5,}\\b/', $texto, $matches);

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

        preg_match('/\\b\\d{5,}\\b/', $texto, $matches);

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
