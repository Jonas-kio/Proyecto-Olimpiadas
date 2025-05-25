<?php

namespace App\Console\Commands;

use App\Models\Boleta;
use App\Models\RegistrationProcess;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RepararProcesosInactivos extends Command
{
    protected $signature = 'procesos:reparar';
    protected $description = 'Repara procesos de inscripción marcados incorrectamente como inactivos';

    public function handle()
    {
        $this->info('Iniciando reparación de procesos inactivos...');

        $procesosInactivos = RegistrationProcess::where('active', false)->get();

        $this->info("Se encontraron {$procesosInactivos->count()} procesos inactivos");

        $procesosReparados = 0;

        foreach ($procesosInactivos as $proceso) {
            $tieneBoleta = Boleta::where('registration_process_id', $proceso->id)->exists();

            if (!$tieneBoleta) {
                $proceso->active = true;
                $proceso->save();

                $procesosReparados++;
                Log::info("Proceso {$proceso->id} reparado: Estado de activación cambiado a ACTIVO");
                $this->info("Proceso {$proceso->id} reparado: Se activó el proceso");
            }
        }

        $this->info("Reparación completada. Se repararon {$procesosReparados} procesos.");

        return Command::SUCCESS;
    }
}
