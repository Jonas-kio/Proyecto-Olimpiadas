<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileCargaMasiva extends Model
{
    protected $table = 'file_carga_masiva';

    protected $fillable = [
        'registration_process_id',
        'file_path',
        'original_name',
        'status',
        'error_details',
        'processed_at'
    ];

    protected $casts = [
        'processed_at' => 'datetime'
    ];

    public function registrationProcess()
    {
        return $this->belongsTo(RegistrationProcess::class);
    }
}
