<?php

namespace App\Models;

use App\Enums\BoletaEstado;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Boleta",
 *     title="Boleta",
 *     description="Modelo de Boleta de Inscripción",
 *     @OA\Property(property="id", type="integer", format="int64", readOnly=true),
 *     @OA\Property(property="numero_boleta", type="string", example="BOL-2025-001"),
 *     @OA\Property(property="proceso_id", type="integer"),
 *     @OA\Property(property="monto", type="number", format="float", example="150.00"),
 *     @OA\Property(property="estado", type="string", enum={"pendiente", "pagado", "vencido"}),
 *     @OA\Property(property="fecha_vencimiento", type="string", format="date"),
 *     @OA\Property(property="ruta_pdf", type="string", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time", readOnly=true),
 *     @OA\Property(property="updated_at", type="string", format="date-time", readOnly=true)
 * )
 */
class Boleta extends Model
{
    protected $table = 'boleta';

    protected $fillable = [
        'registration_process_id',
        'numero_boleta',
        'monto_total',
        'fecha_emision',
        'fecha_expiracion',
        'monto_total',
        'estado'
    ];
    protected $casts = [
        'estado' => BoletaEstado::class
    ];


    public function registrationProcess()
    {
        return $this->belongsTo(RegistrationProcess::class);
    }
}
