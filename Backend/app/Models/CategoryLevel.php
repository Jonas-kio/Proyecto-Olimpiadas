<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\GradeName;

/**
 * @OA\Schema(
 *     schema="CategoryLevel",
 *     title="CategoryLevel",
 *     description="Modelo de Nivel/Categoría",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="nombre", type="string", example="Nivel Básico"),
 *     @OA\Property(property="descripcion", type="string", example="Nivel para estudiantes de primaria"),
 *     @OA\Property(property="area_id", type="integer"),
 *     @OA\Property(property="grado", type="string", enum={"primaria", "secundaria"}, example="primaria"),
 *     @OA\Property(property="activo", type="boolean", example=true),
 *     @OA\Property(
 *         property="area",
 *         ref="#/components/schemas/Area"
 *     ),
 *     @OA\Property(property="created_at", type="string", format="date-time", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="date-time", readOnly=true)
 * )
 */
class CategoryLevel extends Model
{
    use HasFactory;

    protected $table = 'category_level';

    protected $fillable = [
        'area_id',
        'name',
        'description',
        'grade_name',
        'grade_min',
        'grade_max'
    ];
    protected $casts = [
        'grade_name' => GradeName::class
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }
}
