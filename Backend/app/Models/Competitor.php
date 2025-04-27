<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Competitor extends Model
{
    protected $table = 'competitor';

    protected $fillable = [
        'nombres',
        'apellidos',
        'documento_identidad',
        'provincia',
        'fecha_nacimiento',
        'curso',
        'correo_electronico',
        'colegio',
    ];
    public function tutores()
    {
        return $this->belongsToMany(Tutor::class, 'competidor_tutor', 'competidor_id', 'tutor_id')
            ->withPivot('es_principal', 'relacion', 'activo');
    }
}
