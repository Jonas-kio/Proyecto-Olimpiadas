<?php

namespace App\Models;

use App\Enums\BoletaEstado;
use Illuminate\Database\Eloquent\Model;

class Boleta extends Model
{
    protected $table = 'boleta';

    protected $fillable = [
        'registration_process_id',
        'numero_boleta',
        'monto_total',
        'fecha_emision',
        'fecha_expiracion',
        'monto_total',
        'estado',
        'validado'
    ];

   protected $casts = [
        'estado' => BoletaEstado::class,
        'fecha_emision' => 'datetime',
        'fecha_expiracion' => 'datetime',
        'validado' => 'boolean',
        'monto_total' => 'decimal:2'
    ];


    public function registrationProcess()
    {
        return $this->belongsTo(RegistrationProcess::class, 'registration_process_id');
    }
}
