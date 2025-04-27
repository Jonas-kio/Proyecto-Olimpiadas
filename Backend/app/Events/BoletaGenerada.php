<?php

namespace App\Events;

use App\Models\Boleta;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BoletaGenerada
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boleta;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\BoletaPago  $boleta
     * @return void
     */
    public function __construct(Boleta $boleta)
    {
        $this->boleta = $boleta;
    }
}

namespace App\Listeners;

use App\Events\BoletaGenerada;
use App\Mail\BoletaMail;
use App\Mail\BoletMail;
use App\Services\BoletaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EnviarNotificacionBoleta implements ShouldQueue
{
    protected $boletaService;

    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct(BoletaService $boletaService)
    {
        $this->boletaService = $boletaService;
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\BoletaGenerada  $event
     * @return void
     */
    public function handle(BoletaGenerada $event)
    {
        try {
            $datosBoleta = $this->boletaService->obtenerDatosBoleta($event->boleta->id);

            $correos = $this->obtenerCorreosDestinatarios($datosBoleta);

            foreach ($correos as $correo) {
                Mail::to($correo)->queue(new BoletaMail($datosBoleta, $event->boleta));
            }

            Log::info('Notificación de boleta enviada', [
                'boleta_id' => $event->boleta->id,
                'destinatarios' => count($correos)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al enviar notificación de boleta', [
                'boleta_id' => $event->boleta->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener lista de correos únicos para enviar notificaciones
     */
    protected function obtenerCorreosDestinatarios(array $datosBoleta)
    {
        $correos = [];

        // Añadir correo del usuario que generó la inscripción
        if (!empty($datosBoleta['proceso']['usuario_correo'])) {
            $correos[] = $datosBoleta['proceso']['usuario_correo'];
        }

        // Añadir correos de los competidores
        foreach ($datosBoleta['competidores'] as $competidor) {
            if (!empty($competidor['correo'])) {
                $correos[] = $competidor['correo'];
            }

            // Añadir correos de los tutores
            foreach ($competidor['tutores'] as $tutor) {
                if (!empty($tutor['correo'])) {
                    $correos[] = $tutor['correo'];
                }
            }
        }

        // Eliminar duplicados y valores vacíos
        return array_unique(array_filter($correos));
    }
}
