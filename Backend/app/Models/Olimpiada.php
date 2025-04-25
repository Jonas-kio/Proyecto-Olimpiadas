<?php

namespace App\Models;

use App\Enums\OlimpiadaEstado;
use App\Enums\OlimpiadaModalidades;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Olimpiada extends Model
{
    use HasFactory;

    protected $table = 'olimpiadas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'cupo_minimo',
        'modalidad',
        'ruta_pdf_detalles',
        'ruta_imagen_portada',
        'estado',
        'activo'
    ];

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'olimpiada_area', 'olimpiada_id', 'area_id')->withTimestamps();
    }

    public function getAreasAttribute()
    {
        return $this->areas()->get();
    }


    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'cupo_minimo' => 'integer',
        'activo' => 'boolean',
        'modalidad' => OlimpiadaModalidades::class,
        'estado' => OlimpiadaEstado::class,
    ];

    public function getFormattedAreasAttribute()
    {
        return $this->areas->map(function ($area) {
            return [
                'id' => $area->id,
                'nombre' => $area->nombre,
                'descripcion' => $area->descripcion ?? null
            ];
        });
    }
}
