<?php

namespace App\Models;

use App\Enums\EstadoInscripcion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="RegistrationProcess",
 *     title="Proceso de Inscripción",
 *     description="Modelo de Proceso de Inscripción",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="olimpiada_id", type="integer"),
 *     @OA\Property(property="user_id", type="integer"),
 *     @OA\Property(property="estado", type="string", enum={"pendiente", "en_proceso", "completado", "cancelado"}),
 *     @OA\Property(property="tipo", type="string", enum={"individual", "grupal"}),
 *     @OA\Property(property="area_id", type="integer", nullable=true),
 *     @OA\Property(property="nivel_id", type="integer", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="date-time", readOnly=true)
 * )
 */
class RegistrationProcess extends Model
{
    use HasFactory;

    protected $table = 'registration_process';

    protected $fillable = [
        'olimpiada_id',
        'user_id',
        'status',
        'start_date',
        'type',
        'active'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'status' => EstadoInscripcion::class,
        'active' => 'boolean'
    ];

    public function olimpiada(): BelongsTo
    {
        return $this->belongsTo(Olimpiada::class);
    }

    public function participante(): BelongsTo
    {
        return $this->belongsTo(Competitor::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }
}
