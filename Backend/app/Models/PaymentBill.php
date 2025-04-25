<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentBill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_number',
        'amount',
        'status',
        'due_date',
        'payment_date',
        'payment_method',
        'transaction_id',
        'payment_details'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date'
    ];

    public function registrationProcess()
    {
        return $this->hasOne(RegistrationProcess::class);
    }
}
