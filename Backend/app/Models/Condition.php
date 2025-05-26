<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Condition extends Model
{
    protected $table = 'condition';

    protected $fillable = [
        'area_id',
        'olimpiada_id',
        'nivel_unico',
        'area_exclusiva'
    ];

    protected $casts = [
        'nivel_unico' => 'boolean',
        'area_exclusiva' => 'boolean'
    ];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function olimpiada(): BelongsTo
    {
        return $this->belongsTo(Olimpiada::class, 'olimpiada_id');
    }
}
