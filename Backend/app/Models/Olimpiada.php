<?php

namespace App\Models;

use App\Enums\OlimpiadaEstado;
use App\Enums\OlimpiadaModalidades;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'maximo_areas',
        'activo'
    ];

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'olimpiada_area', 'olimpiada_id', 'area_id')
            ->withPivot('activo')
            ->withTimestamps();
    }

    public function areasWithConditions(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'olimpiada_area', 'olimpiada_id', 'area_id')
            ->withPivot('activo')
            ->with('conditions')
            ->withTimestamps();
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(Condition::class);
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
            $condition = $this->getAreaConditions($area->id);
            return [
                'id' => $area->id,
                'nombre' => $area->nombre,
                'descripcion' => $area->descripcion ?? null,
                'conditions' => [
                    'nivel_unico' => $condition ? $condition->nivel_unico : false,
                    'area_exclusiva' => $condition ? $condition->area_exclusiva : false
                ]
            ];
        });
    }

    public function hasConditionForArea(int $areaId): bool
    {
        return $this->conditions()
            ->where('area_id', $areaId)
            ->exists();
    }

    public function getAreaConditions(int $areaId)
    {
        return $this->conditions()
            ->where('area_id', $areaId)
            ->first();
    }
}
