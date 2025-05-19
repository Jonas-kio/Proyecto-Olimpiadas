<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BoletaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pdf;
    public $numero;
    public $nombreEstudiante;

    public function __construct($pdf, $numero, $nombreEstudiante = null)
    {
        $this->pdf = $pdf;
        $this->numero = $numero;
        $this->nombreEstudiante = $nombreEstudiante;
    }

    public function build()
    {
        return $this->view('emails.boleta')
            ->subject("Boleta de Pago Nº {$this->numero}")
            ->attachData($this->pdf, "boleta_{$this->numero}.pdf", [
                'mime' => 'application/pdf',
            ]);
    }
}