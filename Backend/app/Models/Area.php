<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 *     schema="Area",
 *     title="Area",
 *     description="Modelo de Área de Olimpiada",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="nombre", type="string", example="Matemáticas"),
 *     @OA\Property(property="descripcion", type="string", example="Área de matemáticas y lógica"),
 *     @OA\Property(property="activo", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="datetime", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="datetime", readOnly=true)
 * )
 */
class Area extends Model
{
    use HasFactory;

    protected $table = 'area';

    protected $fillable = [
        'nombre',
        'descripcion',
        'activo'
    ];

    /* Relación con niveles de categoría
    public function niveles()
    {
        return $this->hasMany(NivelCategoria::class);
    }


    public function costos()
    {
        return $this->hasMany(Costo::class);
    }*/
}
