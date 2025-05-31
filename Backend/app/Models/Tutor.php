<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tutor extends Model
{
    protected $table = 'tutor';

    protected $fillable = [
        'nombres',
        'apellidos',
        'correo_electronico',
        'telefono'
    ];

    /**
     * Relación muchos a muchos con Competitor a través de la tabla pivot competidor_tutor
     */
    public function competidores()
    {
        return $this->belongsToMany(Competitor::class, 'competidor_tutor', 'tutor_id', 'competidor_id')
            ->withPivot('es_principal', 'relacion', 'activo')
            ->withTimestamps();
    }
}
