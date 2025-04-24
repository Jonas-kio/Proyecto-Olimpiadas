<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BoletaPagoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $datos;
    public $pdf;

    public function __construct($datos, $pdf)
    {
        $this->datos = $datos;
        $this->pdf = $pdf;
    }

    public function build()
    {
        return $this->subject('Boleta de Pago - Olimpiadas')
            ->view('emails.boleta')
            ->attachData($this->pdf, 'Boleta_'.$this->datos['numeroBoleta'].'.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}