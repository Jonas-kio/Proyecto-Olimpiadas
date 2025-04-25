<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class BoletaMail extends Mailable
{
    public $pdf;
    public $numero;

    public function __construct($pdf, $numero)
    {
        $this->pdf = $pdf;
        $this->numero = $numero;
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