<?php

namespace App\Services;

use App\Enums\BoletaEstado;
use App\Enums\EstadoInscripcion;
use App\Models\Boleta;
use App\Models\ComprobantePago;
use App\Models\RegistrationProcess;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use thiagoalessio\TesseractOCR\TesseractOCR;

class OcrService
{

    const MAX_INTENTOS = 3;

    public function procesarComprobante(UploadedFile $imagen, $registrationProcessId)
    {
        try {
            $registration = RegistrationProcess::findOrFail($registrationProcessId);

            if ($registration->status === EstadoInscripcion::INSCRITO->value) {
                throw new \Exception('Esta inscripción ya se encuentra en estado INSCRITO.');
            }
            if ($registration->status === EstadoInscripcion::RECHAZADO->value) {
                throw new \Exception('Este proceso de inscripción ya esta en estado de rechazo.');
            }

            DB::beginTransaction();

            $intentosActuales = ComprobantePago::where('registration_process_id', $registrationProcessId)->count();
            if ($intentosActuales >= self::MAX_INTENTOS && $registration->status === EstadoInscripcion::PENDIENTE->value) {
                $registration->update(['status' => EstadoInscripcion::RECHAZADO->value]);
                return [
                    'success' => false,
                    'mensaje' => 'Se ha alcanzado el número máximo de intentos permitidos.',
                    'intentos_restantes' => 0
                ];
            }

            // 4. Procesar imagen
            $resultadoOcr = $this->procesarImagen($imagen);
            if (!$resultadoOcr['success']) {
                throw new \Exception('Error al procesar la imagen: ' . $resultadoOcr['error']);
            }

            // 5. Extraer número de boleta
            $numeroBoleta = $this->extraerNumeroBoleta($resultadoOcr['texto']);
            if (!$numeroBoleta) {
                throw new \Exception('No se encontró un número de boleta válido.');
            }

            // 6. Buscar la boleta asociada al proceso
            $boleta = Boleta::where('registration_process_id', $registrationProcessId)
                          ->where('numero_boleta', $numeroBoleta)
                          ->where('validado', false)
                          ->first();
            if (!$boleta) {
                throw new \Exception('La boleta no corresponde a esta inscripción o ya fue validada.');
            }

            if ($boleta->estado === BoletaEstado::PENDIENTE->value) {
                throw new \Exception('Primero debe pagar la boleta antes de validarla.');
            }

            // 7. Determinar si es grupal basado en el tipo de numero de boleta extraida
            $esGrupal = $this->esBoleraGrupal($numeroBoleta);
            $nombrePagador = null;

            if ($esGrupal) {
                $nombrePagador = $this->extraerNombrePagador($resultadoOcr['texto']);
                if (!$nombrePagador) {
                    throw new \Exception('No se pudo detectar el nombre del pagador en el comprobante grupal.');
                }
            }

            // 8. Guardar el comprobante
            $rutaImagen = $this->guardarImagen($imagen);
            $comprobante = ComprobantePago::create([
                'registration_process_id' => $registrationProcessId,
                'boleta_id' => $boleta->id,
                'ruta_imagen' => $rutaImagen,
                'texto_detectado' => $resultadoOcr['texto'],
                'numero_boleta_detectado' => $numeroBoleta,
                'nombre_pagador_detectado' => $nombrePagador,
                'validacion_exitosa' => true,
                'es_pago_grupal' => $esGrupal,
                'intento_numero' => $intentosActuales + 1,
                'metadata_ocr' => json_encode([
                    'fecha_procesamiento' => now(),
                    'tipo_inscripcion' => $registration->type
                ])
            ]);

            // 9. Actualizar estados
            $boleta->update(['validado' => true]);
            $registration->update(['status' => EstadoInscripcion::INSCRITO->value]);

            DB::commit();

            return [
                'success' => true,
                'mensaje' => 'Comprobante validado exitosamente',
                'comprobante' => $comprobante
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            // Registrar el intento fallido
            ComprobantePago::create([
                'registration_process_id' => $registrationProcessId, // Campo requerido
                'texto_detectado' => $resultadoOcr['texto'] ?? null,
                'validacion_exitosa' => false,
                'es_pago_grupal' => false,
                'intento_numero' => ($intentosActuales ?? 0) + 1,
                'metadata_ocr' => json_encode([
                    'fecha_procesamiento' => now(),
                    'error_mensaje' => $e->getMessage(),
                    'intentos_previos' => $intentosActuales ?? 0
                ])
            ]);
            return [
                'success' => false,
                'mensaje' => $e->getMessage(),
                'intentos_restantes' => self::MAX_INTENTOS - (($intentosActuales ?? 0) + 1)
            ];
        }
    }

    private function guardarImagen(UploadedFile $imagen): string
    {
        return $imagen->storeAs(
            'comprobantes',
            'comp_' . uniqid() . '.' . $imagen->getClientOriginalExtension(),
            'public'
        );
    }

    private function extraerNumeroBoleta(string $texto): ?string
    {
        $patron = '/BOL-(IND|GRP)-\d{8}-[A-Z0-9]{6}/i';

        if (preg_match($patron, $texto, $coincidencias)) {
            return $coincidencias[0];
        }

        return null;
    }

    private function esBoleraGrupal(string $numeroBoleta): bool
    {
        return stripos($numeroBoleta, 'BOL-GRP') === 0;
    }

    private function extraerNombrePagador(string $texto): ?string
    {
        $patrones = [
            '/depositante[:\s]*([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)(?:\s|$)/i',
            '/pagador[:\s]*([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)(?:\s|$)/i',
            '/nombre[:\s]*([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)(?:\s|$)/i'
        ];

        foreach ($patrones as $patron) {
            if (preg_match($patron, $texto, $coincidencias)) {
                return trim($coincidencias[1]);
            }
        }
        return null;
    }

    private function procesarImagen(UploadedFile $imagen)
    {
        try {
            $ruta = $imagen->storeAs('temp_ocr', uniqid() . '.' . $imagen->getClientOriginalExtension(), 'public');
            $rutaCompleta = storage_path('app/public/' . $ruta);

            $ocr = new TesseractOCR($rutaCompleta);
            $ocr->executable('C:\Program Files\Tesseract-OCR\tesseract.exe');
            $ocr->lang('spa');

            $texto = $ocr->run();

            Storage::disk('public')->delete($ruta);

            return [
                'success' => true,
                'texto' => $texto
            ];

        } catch (\Exception $e) {
            if (isset($ruta)) {
                Storage::disk('public')->delete($ruta);
            }

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
