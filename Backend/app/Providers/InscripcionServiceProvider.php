<?php

namespace App\Providers;

use App\Repositories\ProcesoInscripcionRepository;
use App\Services\ExcelProcessorService;
use App\Services\InscripcionGrupalService;
use Illuminate\Support\ServiceProvider;

class InscripcionServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Registramos el servicio de procesamiento de Excel
        $this->app->singleton(ExcelProcessorService::class, function ($app) {
            return new ExcelProcessorService();
        });

        // Registramos el servicio de inscripción grupal
        $this->app->singleton(InscripcionGrupalService::class, function ($app) {
            return new InscripcionGrupalService(
                $app->make(ProcesoInscripcionRepository::class),
                $app->make(ExcelProcessorService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
