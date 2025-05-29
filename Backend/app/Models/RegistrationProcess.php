<?php

namespace App\Models;

use App\Enums\EstadoInscripcion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function olimpiada() {
        return $this->belongsTo(Olimpiada::class);
    }

    public function detalles() {
        return $this->hasMany(DetalleInscripcion::class, 'register_process_id');
    }

    //  AGREGAR ESTA RELACIÓN
    public function detalleInscripcion()
    {
        return $this->hasOne(DetalleInscripcion::class, 'register_process_id');
    }

    public function boleta() {
        return $this->hasOne(Boleta::class, 'registration_process_id');
    }
    
    public function participante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}