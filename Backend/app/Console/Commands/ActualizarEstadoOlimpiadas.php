<?php

namespace App\Console\Commands;

use App\Services\OlimpiadaService;
use Illuminate\Console\Command;

class ActualizarEstadosOlimpiadas extends Command
{

    protected $signature = 'olimpiadas:actualizar-estados';


    protected $description = 'Actualiza automáticamente los estados de las olimpiadas según sus fechas';

    public function handle(OlimpiadaService $olimpiadaService)
    {
        $this->info('Iniciando actualización de estados de olimpiadas...');

        try {
            $olimpiadaService->actualizarEstadosOlimpiadas();
            $this->info('Estados de olimpiadas actualizados correctamente.');
            return 0;
        } catch (\Exception $e) {
            $this->error('Error al actualizar estados: ' . $e->getMessage());
            return 1;
        }
    }
}
