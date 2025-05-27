<?php

namespace App\Services\Helpers;

use App\Models\RegistrationProcess;
use Exception;

class InscripcionHelper
{

    public static function verificarProcesoActivo(RegistrationProcess $proceso, string $accion = 'realizar esta operación', bool $ignorarEstadoActivo = false)
    {
        if (!$ignorarEstadoActivo && !$proceso->active) {
            throw new Exception("El proceso de inscripción está cerrado. No es posible {$accion} después de generar la boleta de pago.");
        }
    }
}
