<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
