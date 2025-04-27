<?php

namespace App\Http\Middleware;

use App\Models\RegistrationProcess;
use App\Models\User;
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
            return response()->json([
                'success' => false,
                'message' => 'El proceso de inscripción no está activo'
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
