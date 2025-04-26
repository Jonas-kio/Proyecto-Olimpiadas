<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boleta extends Model
{
    protected $table = 'boleta';

    protected $fillable = [
        'numero_boleta',
        'registration_detail_id',
    ];

    public function registrationDetail()
    {
        return $this->belongsTo(RegistrationDetail::class);
    }
}