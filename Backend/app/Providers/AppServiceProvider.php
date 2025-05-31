<?php

namespace App\Providers;

use App\Providers\InscripcionServiceProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registramos el proveedor de servicios de inscripción
        $this->app->register(InscripcionServiceProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
