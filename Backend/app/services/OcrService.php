<?php

namespace App\Services;

use App\Enums\BoletaEstado;
use App\Enums\EstadoInscripcion;
use App\Models\Boleta;
use App\Models\ComprobantePago;
use App\Models\RegistrationProcess;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OcrService
{

    const MAX_INTENTOS = 3;
    protected $inscripcionService;

    public function __construct(InscripcionService $inscripcionService)
    {
        $this->inscripcionService = $inscripcionService;
    }

    public function procesarComprobante(string $textoOCR, ?UploadedFile $imagen, $registrationProcessId)
    {
        try {
            if (!$registrationProcessId) {
                throw new \Exception('ID del proceso de registro no proporcionado');
            }

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

            // 4. Extraer número de boleta
            $numeroBoleta = $this->extraerNumeroBoleta($textoOCR);
            if (!$numeroBoleta) {
                throw new \Exception('No se encontró un número de boleta válido.');
            }

            // 5. Buscar la boleta asociada al proceso
            $boleta = Boleta::where('registration_process_id', $registrationProcessId)
                          ->where('numero_boleta', $numeroBoleta)
                          ->where('validado', false)
                          ->first();
            if (!$boleta) {
                throw new \Exception('La boleta no corresponde a esta inscripción o ya fue validada.');
            }

            if ($boleta->estado === BoletaEstado::PAGADO->value) {
                throw new \Exception('La boleta ya se encuentra en estado PAGADO y no puede ser procesada nuevamente.');
            }

            // 7. Determinar si es grupal basado en el tipo de numero de boleta extraida
            $esGrupal = $this->esBoleraGrupal($numeroBoleta);
            $nombrePagador = null;

            if ($esGrupal) {
                $nombrePagador = $this->extraerNombrePagador($textoOCR);
                if (!$nombrePagador) {
                    throw new \Exception('No se pudo detectar el nombre del pagador en el comprobante grupal.');
                }
            }

            $rutaImagen = null;
            if ($imagen) {
                $rutaImagen = $this->guardarImagen($imagen);
            }

            $comprobante = ComprobantePago::create([
                'registration_process_id' => $registrationProcessId, // ¡Campo añadido!
                'boleta_id' => $boleta->id,
                'ruta_imagen' => $rutaImagen,
                'texto_detectado' => $textoOCR,
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
            $boleta->update([
                'validado' => true,
                'estado' => BoletaEstado::PAGADO->value
            ]);
            $this->inscripcionService->actualizarEstadoProcesoTemporalmente(
                $registration,
                EstadoInscripcion::INSCRITO
            );
            //$registration->update(['status' => EstadoInscripcion::INSCRITO->value]);

            DB::commit();

            return [
                'success' => true,
                'mensaje' => 'Comprobante validado exitosamente',
                'comprobante' => $comprobante
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            try {
                // Aquí está el cambio: Asegurarse de que registration_process_id se incluye
                    ComprobantePago::create([
                        'registration_process_id' => $registrationProcessId, // ¡Asegúrate de que este campo esté incluido!
                        'boleta_id' => null,
                        'ruta_imagen' => $imagen ? $this->guardarImagen($imagen) : null,
                        'texto_detectado' => $textoOCR,
                        'validacion_exitosa' => false,
                        'es_pago_grupal' => false,
                        'intento_numero' => ($intentosActuales ?? 0) + 1,
                        'metadata_ocr' => json_encode([
                            'fecha_procesamiento' => now(),
                            'error_mensaje' => $e->getMessage(),
                            'intentos_previos' => $intentosActuales ?? 0,
                            'procesado_en_frontend' => true
                        ])
                    ]);
                } catch (\Exception $innerException) {
                    // Logear el error para depuración
                    Log::error('Error al crear registro de comprobante fallido: ' . $innerException->getMessage());
                }
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
}
