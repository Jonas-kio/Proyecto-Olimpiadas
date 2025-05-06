<?php

namespace App\Models;

use App\Enums\OlimpiadaEstado;
use App\Enums\OlimpiadaModalidades;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @OA\Schema(
 *     schema="Olimpiada",
 *     title="Olimpiada",
 *     description="Modelo de Olimpiada",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="nombre", type="string", example="Olimpiada de Matemáticas 2025"),
 *     @OA\Property(property="descripcion", type="string", example="Competencia nacional de matemáticas"),
 *     @OA\Property(property="fecha_inicio", type="string", format="date", example="2025-06-01"),
 *     @OA\Property(property="fecha_fin", type="string", format="date", example="2025-06-30"),
 *     @OA\Property(property="cupo_minimo", type="integer", example=50),
 *     @OA\Property(property="modalidad", type="string", example="Presencial"),
 *     @OA\Property(property="pdf_detalles", type="string", example="olimpiada_detalles.pdf"),
 *     @OA\Property(property="imagen_portada", type="string", example="olimpiada_portada.jpg"),
 *     @OA\Property(property="activo", type="boolean", example=true),
 *     @OA\Property(
 *         property="areas",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/Area")
 *     ),
 *     @OA\Property(property="created_at", type="string", format="datetime", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="datetime", readOnly=true)
 * )
 */
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
        return $this->belongsToMany(Area::class, 'olimpiada_area', 'olimpiada_id', 'area_id')
            ->withPivot('activo')
            ->withTimestamps();
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
