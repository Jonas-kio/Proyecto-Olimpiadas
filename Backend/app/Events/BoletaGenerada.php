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
            $datosBoleta = $this->boletaService->obtenerDatosBoleta(
                $event->boleta->registration_process_id,
                $event->boleta->id
            );

            if (!isset($datosBoleta['data'])) {
                throw new \Exception('Datos de boleta incompletos');
            }

            $correos = $this->obtenerCorreosDestinatarios($datosBoleta['data']);

            foreach ($correos as $correo) {
                Mail::to($correo)->queue(new BoletaMail($datosBoleta['data'], $event->boleta));
            }

            Log::info('Notificación de boleta enviada', [
                'boleta_id' => $event->boleta->id,
                'proceso_id' => $event->boleta->registration_process_id,
                'destinatarios' => count($correos)
            ]);

        } catch (\Exception $e) {
            Log::error('Error al enviar notificación de boleta', [
                'boleta_id' => $event->boleta->id,
                'proceso_id' => $event->boleta->registration_process_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }


    protected function obtenerCorreosDestinatarios(array $datosBoleta)
    {
        $correos = [];

        if (!empty($datosBoleta['proceso']['user']['email'])) {
            $correos[] = $datosBoleta['proceso']['user']['email'];
        }

        if (isset($datosBoleta['competidores']) && is_array($datosBoleta['competidores'])) {
            foreach ($datosBoleta['competidores'] as $competidor) {
                if (!empty($competidor['correo_electronico'])) {
                    $correos[] = $competidor['correo_electronico'];
                }

                // Añadir correos de los tutores
                if (isset($competidor['tutores']) && is_array($competidor['tutores'])) {
                    foreach ($competidor['tutores'] as $tutor) {
                        if (!empty($tutor['correo_electronico'])) {
                            $correos[] = $tutor['correo_electronico'];
                        }
                    }
                }
            }
        }

        return array_unique(array_filter($correos));
    }
}
