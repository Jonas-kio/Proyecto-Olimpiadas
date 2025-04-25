<?php

namespace App\Models;

use App\Enums\EstadoInscripcion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationProcess extends Model
{
    use HasFactory;

    protected $fillable = [
        'competitor_id',
        'tutor_id',
        'olimpiada_id',
        'area_id',
        'category_level_id',
        'payment_bill_id',
        'status',
        'rejection_reason'
    ];

    protected $casts = [
        'status' => EstadoInscripcion::class,
    ];

    public function competitor()
    {
        return $this->belongsTo(Competitor::class);
    }

    public function tutor()
    {
        return $this->belongsTo(Tutor::class);
    }

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function categoryLevel()
    {
        return $this->belongsTo(CategoryLevel::class);
    }

    public function paymentBill()
    {
        return $this->belongsTo(PaymentBill::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }

    public function getStatusColorAttribute(): string
    {
        return $this->status->color();
    }
}
