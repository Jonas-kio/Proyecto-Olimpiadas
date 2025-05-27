<?php

namespace App\Console;

use App\Console\Commands\ActualizarEstadoOlimpiadas;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{

    protected $commands = [
        ActualizarEstadoOlimpiadas::class,
    ];


    protected function schedule(Schedule $schedule)
    {
        $schedule->command('olimpiadas:actualizar-estados')->dailyAt('00:01');
    }


    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
