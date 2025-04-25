<?php

namespace App\Http\Requests\Inscripcion;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarPagoRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|string|max:100',
            'transaction_id' => 'required|string|max:255',
            'payment_details' => 'nullable|string',
        ];
    }


    public function messages(): array
    {
        return [
            'payment_method.required' => 'El método de pago es requerido',
            'payment_method.string' => 'El método de pago debe ser texto',
            'payment_method.max' => 'El método de pago no debe exceder los 100 caracteres',
            'transaction_id.required' => 'El ID de la transacción es requerido',
            'transaction_id.string' => 'El ID de la transacción debe ser texto',
            'transaction_id.max' => 'El ID de la transacción no debe exceder los 255 caracteres',
            'payment_details.string' => 'Los detalles del pago deben ser texto',
        ];
    }
}
