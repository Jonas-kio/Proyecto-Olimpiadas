<?php

namespace App\Http\Requests\OCR;

use Illuminate\Foundation\Http\FormRequest;

class ProcesarComprobanteRequest extends FormRequest
{
     public function authorize()
    {
        return true;
    }
    protected function prepareForValidation()
    {
        $this->merge([
            'registration_process_id' => (int) $this->registration_process_id
        ]);
    }

    public function rules()
    {
        return [
            'imagen' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'registration_process_id' => 'required|exists:registration_process,id'
        ];
    }

    public function messages()
    {
        return [
            'imagen.required' => 'La imagen del comprobante es requerida',
            'imagen.image' => 'El archivo debe ser una imagen',
            'imagen.mimes' => 'El formato debe ser jpeg, png o jpg',
            'imagen.max' => 'La imagen no debe pesar más de 2MB',
            'registration_process_id.required' => 'El ID del proceso de registro es requerido',
            'registration_process_id.integer' => 'El ID del proceso debe ser un número entero',
            'registration_process_id.exists' => 'El proceso de registro no existe'
        ];
    }
}
