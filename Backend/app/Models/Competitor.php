<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Competitor",
 *     title="Competitor",
 *     description="Modelo de Competidor",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="nombres", type="string", example="Juan"),
 *     @OA\Property(property="apellidos", type="string", example="Pérez"),
 *     @OA\Property(property="documento_identidad", type="string", example="123456"),
 *     @OA\Property(property="provincia", type="string", example="La Paz"),
 *     @OA\Property(property="fecha_nacimiento", type="string", format="date", example="2000-01-01"),
 *     @OA\Property(property="curso", type="string", example="4to Secundaria"),
 *     @OA\Property(property="correo_electronico", type="string", format="email", example="juan@ejemplo.com"),
 *     @OA\Property(property="colegio", type="string", example="Colegio San Francisco"),
 *     @OA\Property(property="created_at", type="string", format="datetime", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="datetime", readOnly=true)
 * )
 */
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
