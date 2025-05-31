<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompetidorAreaNivel extends Model
{
    protected $table = 'competidor_area_nivel';

    protected $fillable = [
        'competitor_id',
        'area_id',
        'category_level_id',
        'registration_process_id'
    ];

    public function competidor()
    {
        return $this->belongsTo(Competitor::class, 'competitor_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function nivel()
    {
        return $this->belongsTo(CategoryLevel::class, 'category_level_id');
    }

    public function registrationProcess()
    {
        return $this->belongsTo(RegistrationProcess::class);
    }
}
