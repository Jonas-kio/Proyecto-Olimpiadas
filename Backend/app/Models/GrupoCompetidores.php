<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrupoCompetidores extends Model
{
    protected $table = 'grupo_competidores';

    protected $fillable = [
        'registration_process_id',
        'nombre',
        'descripcion'
    ];

    public function competidores()
    {
        return $this->belongsToMany(Competitor::class, 'grupo_competidor', 'grupo_competidores_id', 'competitor_id');
    }

    public function registrationProcess()
    {
        return $this->belongsTo(RegistrationProcess::class);
    }
}
