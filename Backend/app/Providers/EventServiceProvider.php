<?php

namespace App\Providers;

use App\Events\BoletaGenerada;
use App\Listeners\EnviarNotificacionBoleta;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, 
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        BoletaGenerada::class => [
            EnviarNotificacionBoleta::class,
        ],
    ];

    public function boot(): void
    {
        
    }


    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
