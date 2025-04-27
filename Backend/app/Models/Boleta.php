<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boleta extends Model
{
    protected $table = 'boleta';

    protected $fillable = [
        'numero',
        'fecha_emision',
        'monto_total',
        'correo_destino',
        'nombre_competidor',
        'estado',
        'registration_process_id',
    ];

    public function registrationProcess()
    {
        return $this->belongsTo(RegistrationProcess::class);
    }
}