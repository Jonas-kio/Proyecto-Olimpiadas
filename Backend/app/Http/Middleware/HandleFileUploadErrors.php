<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class HandleFileUploadErrors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Verificar si hay errores de upload antes de procesar
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            if ($file && $file->getError() !== UPLOAD_ERR_OK) {
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'El archivo es demasiado grande según la configuración del servidor',
                    UPLOAD_ERR_FORM_SIZE => 'El archivo es demasiado grande según el formulario',
                    UPLOAD_ERR_PARTIAL => 'El archivo se subió parcialmente',
                    UPLOAD_ERR_NO_FILE => 'No se subió ningún archivo',
                    UPLOAD_ERR_NO_TMP_DIR => 'Error de configuración del servidor: directorio temporal no disponible',
                    UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo al disco',
                    UPLOAD_ERR_EXTENSION => 'Una extensión de PHP detuvo la subida'
                ];

                $errorMsg = $errorMessages[$file->getError()] ?? 'Error desconocido en la subida';

                return response()->json([
                    'success' => false,
                    'mensaje' => 'Error al subir el archivo: ' . $errorMsg,
                    'error_code' => $file->getError()
                ], 422);
            }
        }

        return $next($request);
    }
}
