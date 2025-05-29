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
            'texto' => 'required|string', // Texto extraído del OCR
            'comprobante' => 'required|string', // Imagen en formato base64
            'registration_process_id' => 'required|exists:registration_process,id'
        ];
    }

    public function messages()
    {
        return [
            'texto.required' => 'El texto extraído del comprobante es requerido',
            'texto.string' => 'El texto debe ser una cadena de caracteres',
            'comprobante.required' => 'La imagen del comprobante es requerida',
            'comprobante.string' => 'La imagen debe ser una cadena en formato base64',
            'registration_process_id.required' => 'El ID del proceso de registro es requerido',
            'registration_process_id.exists' => 'El proceso de registro no existe'
        ];
    }

    public function getImageFile()
    {
        try {
            $base64Image = $this->comprobante;
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $matches)) {
                $imageData = substr($base64Image, strpos($base64Image, ',') + 1);
                $imageType = strtolower($matches[1]);
                // Decodificar la imagen
                $decodedImage = base64_decode($imageData);

                if ($decodedImage === false) {
                    return null;
                }

                // Crear un nombre de archivo temporal
                $tempFile = tempnam(sys_get_temp_dir(), 'comprobante_') . '.' . $imageType;
                file_put_contents($tempFile, $decodedImage);

                // Crear un objeto UploadedFile a partir del archivo temporal
                $uploadedFile = new \Illuminate\Http\UploadedFile(
                    $tempFile,
                    'comprobante.' . $imageType,
                    'image/' . $imageType,
                    null,
                    true
                );

                return $uploadedFile;
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getTextoOCR()
    {
        return $this->texto;
    }
}
