<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Tutor",
 *     title="Tutor",
 *     description="Modelo de Tutor",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="nombres", type="string", example="Juan"),
 *     @OA\Property(property="apellidos", type="string", example="Pérez"),
 *     @OA\Property(property="documento_identidad", type="string", example="123456"),
 *     @OA\Property(property="telefono", type="string", example="77712345"),
 *     @OA\Property(property="correo_electronico", type="string", format="email", example="juan@ejemplo.com"),
 *     @OA\Property(property="direccion", type="string", example="Calle 123"),
 *     @OA\Property(
 *         property="competidores",
 *         type="array",
 *         @OA\Items(
 *             @OA\Property(property="id", type="integer"),
 *             @OA\Property(property="es_principal", type="boolean"),
 *             @OA\Property(property="relacion", type="string", example="padre")
 *         )
 *     ),
 *     @OA\Property(property="created_at", type="string", format="date-time", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="date-time", readOnly=true)
 * )
 */
class Tutor extends Model
{
    protected $table = 'tutor';

    protected $fillable = [
        'nombres',
        'apellidos',
        'correo_electronico',
        'telefono'
    ];
}
