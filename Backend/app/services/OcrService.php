<?php

namespace App\Services;

use thiagoalessio\TesseractOCR\TesseractOCR;

class OcrService
{
    public function procesarImagen($rutaImagen)
    {
        $texto = (new TesseractOCR($rutaImagen))
            ->lang('spa')
            ->run();

        preg_match('/\b\d{5,}\b/', $texto, $matches);

        return [
            'numero_detectado' => $matches[0] ?? null,
            'texto_completo' => $texto
        ];
    }
}