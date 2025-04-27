<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompetidorTutor extends Model
{
    use HasFactory;

    protected $table = 'competidor_tutor';

    protected $fillable = [
        'competidor_id',
        'tutor_id',
        'es_principal',
        'relacion',
        'activo'
    ];

    protected $casts = [
        'es_principal' => 'boolean',
        'activo' => 'boolean',
    ];

    public function competidor()
    {
        return $this->belongsTo(Competitor::class);
    }

    public function tutor()
    {
        return $this->belongsTo(Tutor::class);
    }
}