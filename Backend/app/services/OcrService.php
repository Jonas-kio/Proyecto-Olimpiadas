<?php

namespace App\Services;

use App\Enums\BoletaEstado;
use App\Enums\EstadoInscripcion;
use App\Models\Boleta;
use App\Models\Competitor;
use App\Models\ComprobantePago;
use App\Models\RegistrationProcess;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OcrService
{

    const MAX_INTENTOS = 3;
    protected InscripcionService $inscripcionService;

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

            $numeroBoleta = $this->extraerNumeroBoleta($textoOCR);
            if (!$numeroBoleta) {
                throw new \Exception('No se encontró un número de boleta válido.');
            }

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
                'registration_process_id' => $registrationProcessId,
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

            $boleta->update([
                'validado' => true,
                'estado' => BoletaEstado::PAGADO->value
            ]);
            $this->inscripcionService->actualizarEstadoProcesoTemporalmente(
                $registration,
                EstadoInscripcion::INSCRITO
            );

            DB::commit();

            return [
                'success' => true,
                'mensaje' => 'Comprobante validado exitosamente',
                'comprobante' => $comprobante
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            try {
                ComprobantePago::create([
                    'registration_process_id' => $registrationProcessId,
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
            '/nombre[:\s]*([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)(?:\s|$)/i',
            '/Tutor[:\s]*([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)(?:\s|$)/i',
            '/Responsable[:\s]*([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)(?:\s|$)/i'
        ];

        foreach ($patrones as $patron) {
            if (preg_match($patron, $texto, $coincidencias)) {
                return trim($coincidencias[1]);
            }
        }
        return null;
    }


    public function obtenerCompetidoresAsociadosPorNombrePAgador($registrationProcessId):array
    {
        try {

            if (!$registrationProcessId) {
                throw new \Exception('ID del proceso de registro no proporcionado');
            }

            $registrationProcess = $this->inscripcionService->obtenerProcesoPorId($registrationProcessId);
            if (!$registrationProcess) {
                throw new \Exception('Proceso de inscripción no encontrado');
            }

            $comprobante = ComprobantePago::where('registration_process_id', $registrationProcessId)
                ->where('validacion_exitosa', true)
                ->first();

            if (!$comprobante) {
                throw new \Exception('No se encontró un comprobante de pago válido para este proceso de inscripción.');
            }

            $texto = $comprobante->texto_detectado;

            $nombrePagador = $this->extraerNombrePagador($texto);
            if (!$nombrePagador) {
                throw new \Exception('No se pudo extraer el nombre del pagador del comprobante de pago.');
            }

            $nombrePagador = trim($nombrePagador);
            $palabras = explode(' ', $nombrePagador);

            $mitad = ceil(count($palabras) / 2);
            $posiblesNombres = implode(' ', array_slice($palabras, 0, $mitad));
            $posiblesApellidos = implode(' ', array_slice($palabras, $mitad));

            $tutor = Tutor::where(function($query) use ($posiblesNombres, $posiblesApellidos) {
                $query->where(function($q) use ($posiblesNombres, $posiblesApellidos) {
                    $q->where('nombres', 'LIKE', '%' . $posiblesNombres . '%')
                    ->where('apellidos', 'LIKE', '%' . $posiblesApellidos . '%');
                })
                ->orWhere(function($q) use ($posiblesNombres, $posiblesApellidos) {
                    $q->where('nombres', 'LIKE', '%' . $posiblesApellidos . '%')
                    ->where('apellidos', 'LIKE', '%' . $posiblesNombres . '%');
                });
            })->first();

            if (!$tutor) {
                throw new \Exception('No se encontró un tutor que coincida con el nombre "' . $nombrePagador . '" en nuestros registros.');
            }

            $competidores = Competitor::join('competidor_tutor as ct', 'competitor.id', '=', 'ct.competidor_id')
                ->join('registration_detail as di', 'competitor.id', '=', 'di.competidor_id')
                ->where('ct.tutor_id', $tutor->id)
                ->where('di.register_process_id', $registrationProcessId)
                ->select('competitor.*', 'ct.es_principal', 'ct.relacion')
                ->distinct()
                ->get();

            if ($competidores->isEmpty()) {
                throw new \Exception('No se encontraron competidores asociados al tutor "' . $nombrePagador . '" en este proceso de inscripción.');
            }

            $comprobante->update([
                'nombre_pagador_detectado' => $tutor->nombres . ' ' . $tutor->apellidos,
                'tutor_id' => $tutor->id
            ]);

            return [
                'tutor' => $tutor->nombres . ' ' . $tutor->apellidos,
                'competidores' => $competidores
            ];
        } catch (\Exception $e) {
            Log::error('Error al obtener competidores asociados: ' . $e->getMessage());
            return [
                'success' => false,
                'mensaje' => $e->getMessage()
            ];
        }

    }
}
