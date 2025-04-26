<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class DetalleInscripcion extends Model
{
    use HasFactory;

    protected $table = 'detalle_inscripcion';

    protected $fillable = [
        'proceso_inscripcion_id',
        'competidor_id',
        'area_id',
        'nivel_categoria_id',
        'monto',
        'estado'
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function proceso_inscripcion()
    {
        return $this->belongsTo(ProcesoInscripcion::class);
    }

    public function competidor()
    {
        return $this->belongsTo(Competitor::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function nivel_categoria()
    {
        return $this->belongsTo(CategoryLevel::class);
    }
}
