<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\GradeName;


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
