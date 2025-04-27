<?php

namespace App\Models;

use App\Enums\BoletaEstado;
use Illuminate\Database\Eloquent\Model;

class Boleta extends Model
{
    protected $table = 'boleta';

    protected $fillable = [
        'numero_boleta',
        'registration_process_id',
        'monto_total',
        'fecha_emision',
        'fecha_expiracion',
        'estado'
    ];
    protected $casts = [
        'estado' => BoletaEstado::class
    ];


    public function registrationProcess()
    {
        return $this->belongsTo(RegistrationProcess::class);
    }
}
