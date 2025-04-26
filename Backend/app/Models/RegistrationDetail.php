<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationDetail extends Model
{
    protected $table = 'registration_detail';

    public function boleta()
    {
        return $this->hasOne(Boleta::class);
    }
}