<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Cost",
 *     title="Cost",
 *     description="Modelo de Costos",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="monto", type="number", format="float", example=150.00),
 *     @OA\Property(property="area_id", type="integer"),
 *     @OA\Property(property="descripcion", type="string", example="Costo de inscripción área matemáticas"),
 *     @OA\Property(property="created_at", type="string", format="date-time", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="date-time", readOnly=true)
 * )
 */
class Cost extends Model
{
    use HasFactory;
    protected $table = 'costs';

    protected $fillable = [
        'area_id',
        'category_id',
        'name',
        'price'
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function category_level()
    {
        return $this->belongsTo(CategoryLevel::class);
    }
}
