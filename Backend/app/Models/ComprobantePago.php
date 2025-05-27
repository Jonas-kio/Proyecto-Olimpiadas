<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComprobantePago extends Model
{
    use HasFactory;

    protected $table = 'proof_of_payment';

    protected $fillable = [
        'registration_id',
        'boleta_id',
        'ruta_imagen',
        'texto_detectado',
        'numero_boleta_detectado',
        'nombre_pagador_detectado',
        'monto_detectado',
        'validacion_exitosa',
        'es_pago_grupal',
        'cantidad_participantes',
        'intento_numero',
        'metadata_ocr'
    ];

    protected $casts = [
        'metadata_ocr' => 'array',
        'es_pago_grupal' => 'boolean',
        'validacion_exitosa' => 'boolean',
    ];

    public function registration()
    {
        return $this->belongsTo(RegistrationProcess::class);
    }

    public function boleta()
    {
        return $this->belongsTo(Boleta::class);
    }
}
