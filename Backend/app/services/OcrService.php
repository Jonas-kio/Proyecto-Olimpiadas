<?php

namespace App\Services;

use thiagoalessio\TesseractOCR\TesseractOCR;

class OcrService
{
    public function extraerTexto(string $path): string
    {
        return (new TesseractOCR($path))
            ->lang('spa')
            ->run();
    }

    public function extraerNombrePagador(string $texto): ?string
    {
        preg_match('/Pagado por:\s*(.+)/i', $texto, $matches);
        return $matches[1] ?? null;
    }
}