<?php
namespace App\Http\Controllers;

use app\Models\RegistrationProcess;
use app\Mail\BoletaPagoMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class BoletaPagoController extends Controller
{
    public function generarPDF($registroId)
    {
        $registro = RegistrationProcess::with(['competitor.tutor', 'registrationDetail.area'])->findOrFail($registroId);

        $datos = $this->formatearDatos($registro);

        $pdf = Pdf::loadView('pdf.boleta_pago', $datos);

        return $pdf->download('Boleta_'.$registro->id.'.pdf');
    }

    public function enviarPorCorreo(Request $request)
    {
        $request->validate([
            'registro_id' => 'required|exists:registration_processes,id',
            'correo_destino' => 'required|email',
        ]);

        $registro = RegistrationProcess::with(['competitor.tutor', 'registrationDetail.area'])->findOrFail($request->registro_id);
        $datos = $this->formatearDatos($registro);

        $pdf = Pdf::loadView('pdf.boleta_pago', $datos)->output();

        Mail::to($request->correo_destino)->send(new BoletaPagoMail($datos, $pdf));

        return response()->json(['mensaje' => 'Boleta enviada correctamente']);
    }

    private function formatearDatos($registro)
    {
        $estudiante = $registro->competitor;
        $tutor = $estudiante->tutor;
        $areas = $registro->registrationDetail->pluck('area.nombre');
        $precioArea = 50;
        $totalPago = $areas->count() * $precioArea;

        return [
            'numeroBoleta' => $registro->id,
            'fecha' => now()->format('d/m/Y'),
            'estudiante' => $estudiante,
            'tutor' => $tutor,
            'areas' => $areas,
            'precioArea' => $precioArea,
            'totalPago' => $totalPago,
        ];
    }
}