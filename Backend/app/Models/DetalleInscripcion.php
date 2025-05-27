<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class DetalleInscripcion extends Model
{
    use HasFactory;

    protected $table = 'registration_detail';

    protected $fillable = [
        'register_process_id',
        'competidor_id',
        'area_id',
        'categoria_id',
        'monto',
        'status'
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function proceso_inscripcion()
    {
        return $this->belongsTo(RegistrationProcess::class);
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
