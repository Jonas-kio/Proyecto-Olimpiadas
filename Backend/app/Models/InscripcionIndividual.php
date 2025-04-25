<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InscripcionIndividual extends Model
{
    use HasFactory;

    protected $table = 'inscripciones_individuales';

    protected $fillable = [
        'olimpiada_id',
        'competidor_id',
        'area_id',
        'estado',
        'fecha_inscripcion',
        'comprobante_pago',
        'observaciones'
    ];

    protected $casts = [
        'fecha_inscripcion' => 'datetime',
        'estado' => 'string'
    ];

    public function olimpiada(): BelongsTo
    {
        return $this->belongsTo(Olimpiada::class);
    }

    public function participante(): BelongsTo
    {
        return $this->belongsTo(Competitor::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }
}
