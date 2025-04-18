<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OlimpiadaArea extends Model
{
    use HasFactory;

    protected $table = 'olimpiada_area';

    protected $fillable = [
        'olimpiada_id',
        'area_id',
    ];


    public function olimpiada(): BelongsTo
    {
        return $this->belongsTo(Olimpiada::class);
    }


    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'olimpiada_area', 'olimpiada_id', 'area_id');
    }
}
