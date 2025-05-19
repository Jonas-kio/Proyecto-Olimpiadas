<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


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
