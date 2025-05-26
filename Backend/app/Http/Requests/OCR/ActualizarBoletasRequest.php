<?php

namespace App\Http\Requests\OCR;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarBoletasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            'archivo' => [
                'required',
                'file',
                'max:6048',
                function ($attribute, $value, $fail) {
                    if (!$value || !$value->isValid()) {
                        $fail('El archivo no es válido o está corrupto');
                        return;
                    }

                    $extension = strtolower($value->getClientOriginalExtension());
                    $mimeType = $value->getMimeType();
                    // Lista de tipos MIME aceptados para CSV
                    $validMimeTypes = [
                        'text/csv',
                        'text/plain',
                        'application/csv',
                        'application/vnd.ms-excel',
                        'text/x-csv',
                        'application/x-csv',
                        'text/comma-separated-values',
                        'text/x-comma-separated-values',
                        'text/tab-separated-values'
                    ];

                    if ($extension !== 'csv' && !in_array($mimeType, $validMimeTypes)) {
                        $fail("El archivo debe ser CSV. Tipo detectado: {$mimeType}");
                    }
                }
            ]
        ];
    }

    public function messages()
    {
        return [
            'archivo.required' => 'Debe seleccionar un archivo',
            'archivo.file' => 'El archivo no es válido',
            'archivo.mimes' => 'El archivo debe ser de tipo CSV',
            'archivo.max' => 'El archivo no debe pesar más de 2MB',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        \Illuminate\Support\Facades\Log::error('ActualizarBoletasRequest: Validación fallida', [
            'errores' => $validator->errors()->toArray(),
            'datos_enviados' => $this->all(),
            'archivos' => $this->allFiles(),
            'headers' => $this->header(),
            'content_type' => $this->header('Content-Type')
        ]);

        throw new \Illuminate\Validation\ValidationException($validator, response()->json([
            'success' => false,
            'message' => 'Error de validación del archivo',
            'errors' => $validator->errors(),
            'debug_info' => [
                'content_type' => $this->header('Content-Type'),
                'tiene_archivo' => $this->hasFile('archivo'),
                'metodo' => $this->method()
            ]
        ], 422));
    }
}
