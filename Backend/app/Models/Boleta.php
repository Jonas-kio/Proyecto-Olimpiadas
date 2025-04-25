<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boleta extends Model
{
    protected $fillable = [
        'numero',
        'fecha_emision',
        'monto_total',
        'correo_destino',
        'estado',
    ];
}