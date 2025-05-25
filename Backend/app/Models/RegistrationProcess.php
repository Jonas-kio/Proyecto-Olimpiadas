<?php

namespace App\Models;

use App\Enums\EstadoInscripcion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationProcess extends Model
{
    use HasFactory;

    protected $table = 'registration_process';

    protected $fillable = [
        'olimpiada_id',
        'user_id',
        'status',
        'start_date',
        'type',
        'active'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'status' => EstadoInscripcion::class,
        'active' => 'boolean'
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
