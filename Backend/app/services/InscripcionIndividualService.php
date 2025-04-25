<?php

namespace App\Services;

use App\Models\InscripcionIndividual;
use App\Models\Olimpiada;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InscripcionIndividualService
{
    private const COMPROBANTES_DIRECTORY = 'inscripciones/comprobantes';

    public function createInscripcion(array $data, ?UploadedFile $comprobantePago): InscripcionIndividual
    {
        // Verificar que la olimpiada esté activa
        $olimpiada = Olimpiada::findOrFail($data['olimpiada_id']);
        if (!$olimpiada->activo) {
            throw new \Exception('La olimpiada no está activa');
        }

        // Verificar que el área pertenezca a la olimpiada
        if (!$olimpiada->areas()->where('areas.id', $data['area_id'])->exists()) {
            throw new \Exception('El área seleccionada no pertenece a esta olimpiada');
        }

        // Verificar que no exista una inscripción previa
        if (InscripcionIndividual::where('olimpiada_id', $data['olimpiada_id'])
            ->where('participante_id', $data['participante_id'])
            ->exists()
        ) {
            throw new \Exception('Ya existe una inscripción para este participante en esta olimpiada');
        }

        // Procesar el comprobante de pago si existe
        if ($comprobantePago) {
            $filename = $this->storeComprobantePago($comprobantePago);
            $data['comprobante_pago'] = $filename;
        }

        // Crear la inscripción
        return DB::transaction(function () use ($data) {
            $inscripcion = InscripcionIndividual::create([
                ...$data,
                'fecha_inscripcion' => now(),
                'estado' => 'pendiente'
            ]);

            $this->logInscripcionCreation($inscripcion);

            return $inscripcion->fresh();
        });
    }

    private function storeComprobantePago(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = self::COMPROBANTES_DIRECTORY . '/' . Str::uuid() . '.' . $extension;

        Storage::disk('public')->put($filename, file_get_contents($file));
        $this->logFileUpload($filename);

        return $filename;
    }

    private function logInscripcionCreation(InscripcionIndividual $inscripcion): void
    {
        Log::info('Inscripción individual creada:', [
            'id' => $inscripcion->id,
            'olimpiada_id' => $inscripcion->olimpiada_id,
            'participante_id' => $inscripcion->participante_id,
            'area_id' => $inscripcion->area_id,
            'estado' => $inscripcion->estado
        ]);
    }

    private function logFileUpload(string $path): void
    {
        Log::info('Comprobante de pago subido:', [
            'path' => $path
        ]);
    }
}
