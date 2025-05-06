<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComprobantePago extends Model
{
    use HasFactory;

    protected $table = 'comprobante_pago';

    protected $fillable = [
        'boleta_id',
        'nro_comprobante',
        'monto',
        'fecha_pago',
        'ruta_archivo',
        'verificado_ocr',
        'datos_extraidos_ocr',
        'estado'
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'datetime',
        'verificado_ocr' => 'boolean',
    ];

    public function boleta_pago()
    {
        return $this->belongsTo(Boleta::class);
    }
}
