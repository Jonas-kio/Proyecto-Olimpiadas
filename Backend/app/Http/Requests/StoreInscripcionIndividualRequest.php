<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscripcionIndividualRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'olimpiada_id' => [
                'required',
                'integer',
                'exists:olimpiadas,id'
            ],
            'participante_id' => [
                'required',
                'integer',
                'exists:participantes,id'
            ],
            'area_id' => [
                'required',
                'integer',
                'exists:areas,id'
            ],
            'comprobante_pago' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:2048'
            ],
            'observaciones' => [
                'nullable',
                'string',
                'max:500'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'olimpiada_id.required' => 'La olimpiada es requerida',
            'olimpiada_id.exists' => 'La olimpiada seleccionada no existe',
            'participante_id.required' => 'El participante es requerido',
            'participante_id.exists' => 'El participante seleccionado no existe',
            'area_id.required' => 'El área es requerida',
            'area_id.exists' => 'El área seleccionada no existe',
            'comprobante_pago.required' => 'El comprobante de pago es requerido',
            'comprobante_pago.mimes' => 'El comprobante debe ser un archivo PDF, JPG o PNG',
            'comprobante_pago.max' => 'El comprobante no debe exceder los 2MB',
            'observaciones.max' => 'Las observaciones no deben exceder los 500 caracteres'
        ];
    }
} 