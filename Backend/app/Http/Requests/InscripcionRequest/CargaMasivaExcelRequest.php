<?php

namespace App\Http\Requests\InscripcionRequest;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CargaMasivaExcelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Debug del archivo recibido en la validación
        if ($this->hasFile('file')) {
            $file = $this->file('file');
            \Log::info('CargaMasivaExcelRequest - Archivo recibido para validación:', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'client_mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension(),
                'path' => $file->getRealPath(),
                'is_valid' => $file->isValid(),
                'error' => $file->getError()
            ]);
        } else {
            \Log::warning('CargaMasivaExcelRequest - No se recibió archivo file');
        }

        return [
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls,csv,txt',
                'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,application/csv,application/octet-stream',
                'max:10240' // max 10MB
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Debe seleccionar un archivo.',
            'file.file' => 'El archivo seleccionado no es válido.',
            'file.mimes' => 'El archivo debe ser de tipo Excel (.xlsx, .xls) o CSV (.csv).',
            'file.mimetypes' => 'El archivo debe ser un archivo Excel o CSV válido.',
            'file.max' => 'El archivo no debe ser mayor a 10MB.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        // Debug detallado de la validación fallida
        if ($this->hasFile('file')) {
            $file = $this->file('file');
            \Log::error('CargaMasivaExcelRequest - Validación fallida:', [
                'errors' => $validator->errors()->toArray(),
                'file_info' => [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'client_mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'extension' => $file->getClientOriginalExtension(),
                    'path' => $file->getRealPath(),
                    'is_valid' => $file->isValid(),
                    'error' => $file->getError()
                ]
            ]);
        } else {
            \Log::error('CargaMasivaExcelRequest - Validación fallida sin archivo:', [
                'errors' => $validator->errors()->toArray(),
                'all_files' => $this->allFiles(),
                'all_data' => $this->all()
            ]);
        }

        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Error de validación',
            'errors' => $validator->errors()
        ], 422));
    }
}
