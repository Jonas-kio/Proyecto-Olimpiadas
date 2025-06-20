<?php

namespace App\Http\Middleware;

use App\Models\RegistrationProcess;
use App\Models\User;
use App\Models\Boleta;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerificarProcesoInscripcion
{
    /**
     * Verifica que el usuario tenga acceso al proceso de inscripción
     */
    public function handle(Request $request, Closure $next)
    {
        $proceso = $request->route('proceso');

        if (!$proceso instanceof RegistrationProcess) {
            return response()->json([
                'success' => false,
                'message' => 'Proceso de inscripción no encontrado'
            ], 404);
        }
        if (!Auth::check() || $proceso->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para acceder a este proceso'
            ], 403);
        }


        if (!$proceso->active) {
            // Verificar si ya tiene una boleta generada
            $tieneBoleta = \App\Models\Boleta::where('registration_process_id', $proceso->id)->exists();
            
            $mensaje = 'El proceso de inscripción no está activo';
            if ($tieneBoleta) {
                $mensaje .= ' porque ya se generó una boleta de pago';
            }

            return response()->json([
                'success' => false,
                'message' => $mensaje,
                'proceso_id' => $proceso->id,
                'puede_diagnosticar' => true
            ], 403);
        }

        if (in_array($proceso->estado, ['finalizado', 'cancelado'])) {
            return response()->json([
                'success' => false,
                'message' => 'El proceso de inscripción ya ha finalizado'
            ], 403);
        }

        return $next($request);
    }
}
