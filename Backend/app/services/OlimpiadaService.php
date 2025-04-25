<?php

namespace App\Services;

use App\Enums\OlimpiadaEstado;
use App\Models\Olimpiada;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OlimpiadaService
{
    private const PDF_DIRECTORY = 'olimpiadas/pdfs';
    private const IMAGE_DIRECTORY = 'olimpiadas/portadas';

    public function getPaginatedOlimpiadas(int $perPage = 10): LengthAwarePaginator
    {
        return Olimpiada::with('areas')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createOlimpiada(
        array $data,
        ?UploadedFile $pdfDetalles = null,
        ?UploadedFile $imagenPortada = null,
        ?array $areas = []
    ): Olimpiada {
        return DB::transaction(function () use ($data, $pdfDetalles, $imagenPortada, $areas) {
            $dataEstado = $this->determinarEstado($data['fecha_inicio'], $data['fecha_fin']);
            $data['estado'] = $dataEstado['estado'];
            $data['activo'] = $dataEstado['activo'];


            Log::info('Creando olimpiada con datos', [
                'estado' => $data['estado'],
                'activo' => $data['activo']
            ]);

            $olimpiada = Olimpiada::create($data);

            $olimpiada = Olimpiada::create($data);

            $this->handleFileUploads($olimpiada, $pdfDetalles, $imagenPortada);
            $this->handleAreas($olimpiada, $areas);

            $olimpiada->refresh();
            $this->logOlimpiadaOperation($olimpiada, 'creada');

            return $olimpiada;
        });
    }

    public function updateOlimpiada(
        Olimpiada $olimpiada,
        array $data,
        ?UploadedFile $pdfDetalles = null,
        ?UploadedFile $imagenPortada = null,
        ?array $areas = null
    ): Olimpiada {
        return DB::transaction(function () use ($olimpiada, $data, $pdfDetalles, $imagenPortada, $areas) {
            $this->logUpdateStart($olimpiada, $data, $areas, $pdfDetalles, $imagenPortada);

            $this->processModalidad($data);
            $this->processActivo($data);

            if (isset($data['fecha_inicio']) || isset($data['fecha_fin'])) {
                $fechaInicio = $data['fecha_inicio'] ?? $olimpiada->fecha_inicio;
                $fechaFin = $data['fecha_fin'] ?? $olimpiada->fecha_fin;

                $estadoActivo = $this->determinarEstado($fechaInicio, $fechaFin);

                $data['estado'] = $estadoActivo['estado'];
                $data['activo'] = $estadoActivo['activo'];
            }

            if ($olimpiada->fill($data)->isDirty()) {
                $this->logDirtyFields($olimpiada);
                $olimpiada->save();
            }

            $this->handleFileUploads($olimpiada, $pdfDetalles, $imagenPortada);
            $this->handleAreas($olimpiada, $areas);

            $olimpiada->refresh();
            $this->logOlimpiadaOperation($olimpiada, 'actualizada');

            return $olimpiada;
        });
    }

    public function deleteOlimpiada(Olimpiada $olimpiada): void
    {
        try {
            $this->logOperationStart('eliminación', $olimpiada);

            $this->deleteFiles($olimpiada);
            $olimpiada->delete();

            $this->logOperationSuccess('eliminación', $olimpiada);
        } catch (\Exception $e) {
            $this->logOperationError('eliminación', $olimpiada, $e);
            throw $e;
        }
    }

    private function handleFileUploads(
        Olimpiada $olimpiada,
        ?UploadedFile $pdfDetalles = null,
        ?UploadedFile $imagenPortada = null
    ): void {
        if ($pdfDetalles) {
            $olimpiada->ruta_pdf_detalles = $this->uploadFile($pdfDetalles, self::PDF_DIRECTORY, $olimpiada->ruta_pdf_detalles);
        }

        if ($imagenPortada) {
            $olimpiada->ruta_imagen_portada = $this->uploadFile($imagenPortada, self::IMAGE_DIRECTORY, $olimpiada->ruta_imagen_portada);
        }

        if ($olimpiada->isDirty(['ruta_pdf_detalles', 'ruta_imagen_portada'])) {
            $olimpiada->save();
        }
    }

    private function uploadFile(UploadedFile $file, string $directory, ?string $oldPath = null): string
    {
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return Storage::disk('public')->putFile($directory, $file);
    }

    private function handleAreas(Olimpiada $olimpiada, ?array $areas): void
    {
        if ($areas === null) {
            return;
        }

        $this->logAreasUpdate($areas);

        if (!empty($areas)) {
            $olimpiada->areas()->sync($areas);
        } else {
            $olimpiada->areas()->detach();
        }
    }

    private function processModalidad(array &$data): void
    {
        if (isset($data['modalidad'])) {
            $data['modalidad'] = ucfirst(strtolower($data['modalidad']));
        }
    }

    private function processActivo(array &$data): void
    {
        if (isset($data['activo'])) {
            $data['activo'] = filter_var($data['activo'], FILTER_VALIDATE_BOOLEAN);
        }
    }

    private function deleteFiles(Olimpiada $olimpiada): void
    {
        if ($olimpiada->ruta_pdf_detalles) {
            Storage::disk('public')->delete($olimpiada->ruta_pdf_detalles);
            $this->logFileDeletion('PDF', $olimpiada->ruta_pdf_detalles);
        }

        if ($olimpiada->ruta_imagen_portada) {
            Storage::disk('public')->delete($olimpiada->ruta_imagen_portada);
            $this->logFileDeletion('Imagen', $olimpiada->ruta_imagen_portada);
        }
    }

    private function logUpdateStart(Olimpiada $olimpiada, array $data, ?array $areas, ?UploadedFile $pdfDetalles, ?UploadedFile $imagenPortada): void
    {
        Log::info('Iniciando actualización en servicio:', [
            'olimpiada_id' => $olimpiada->id,
            'data' => $data,
            'areas' => $areas,
            'has_pdf' => $pdfDetalles !== null,
            'has_image' => $imagenPortada !== null
        ]);
    }

    private function logDirtyFields(Olimpiada $olimpiada): void
    {
        Log::info('Campos a actualizar:', $olimpiada->getDirty());
    }

    private function logAreasUpdate(array $areas): void
    {
        Log::info('Actualizando áreas:', ['areas' => $areas]);
    }

    private function logFileDeletion(string $type, string $path): void
    {
        Log::info("{$type} eliminado", ['path' => $path]);
    }

    private function logOlimpiadaOperation(Olimpiada $olimpiada, string $operation): void
    {
        Log::info("Olimpiada {$operation} exitosamente:", [
            'id' => $olimpiada->id,
            'nombre' => $olimpiada->nombre,
            'modalidad' => $olimpiada->modalidad,
            'activo' => $olimpiada->activo,
            'areas_count' => $olimpiada->areas->count()
        ]);
    }

    private function logOperationStart(string $operation, Olimpiada $olimpiada): void
    {
        Log::info("Iniciando {$operation} en servicio", [
            'olimpiada_id' => $olimpiada->id,
            'nombre' => $olimpiada->nombre
        ]);
    }

    private function logOperationSuccess(string $operation, Olimpiada $olimpiada): void
    {
        Log::info("Olimpiada {$operation} exitosamente en servicio", [
            'id' => $olimpiada->id
        ]);
    }

    private function logOperationError(string $operation, Olimpiada $olimpiada, \Exception $e): void
    {
        Log::error("Error al {$operation} la olimpiada en servicio: " . $e->getMessage());
        Log::error($e->getTraceAsString());
    }

    public function getOlimpiadaAreas(Olimpiada $olimpiada)
    {
        return $olimpiada->areas;
    }

    //ESTADO OLIMPIADA

    private function determinarEstado($fechaInicio, $fechaFin): array
    {
        $today = Carbon::today();
        $fechaInicio = $fechaInicio instanceof Carbon ? $fechaInicio : Carbon::parse($fechaInicio);
        $fechaFin = $fechaFin instanceof Carbon ? $fechaFin : Carbon::parse($fechaFin);

        $estado = OlimpiadaEstado::TERMINADO->value;
        $activo = false;

        if ($today->lt($fechaInicio)) {
            $estado = OlimpiadaEstado::PENDIENTE->value;
        } elseif ($today->lte($fechaFin)) {
            $estado = OlimpiadaEstado::ENPROCESO->value;
            $activo = true;
        }

        return [
            'estado' => $estado,
            'activo' => $activo,
        ];
    }

    public function actualizarEstadosOlimpiadas(): void
    {
        $today = Carbon::today();
        Log::info('Actualizando estados de olimpiadas', ['fecha' => $today->toDateString()]);

        $olimpiadasParaIniciar = Olimpiada::where('estado', OlimpiadaEstado::PENDIENTE->value)
            ->where('fecha_inicio', '<=', $today)
            ->get();

        foreach ($olimpiadasParaIniciar as $olimpiada) {
            $olimpiada->estado = OlimpiadaEstado::ENPROCESO->value;
            $olimpiada->activo = true;
            $olimpiada->save();
            Log::info('Olimpiada iniciada', [
                'id' => $olimpiada->id,
                'nombre' => $olimpiada->nombre,
                'activo' => $olimpiada->activo
            ]);
        }

        $olimpiadasParaTerminar = Olimpiada::where('estado', OlimpiadaEstado::ENPROCESO->value)
            ->where('fecha_fin', '<', $today)
            ->get();

        foreach ($olimpiadasParaTerminar as $olimpiada) {
            $olimpiada->estado = OlimpiadaEstado::TERMINADO->value;
            $olimpiada->activo = false;
            $olimpiada->save();
            Log::info('Olimpiada terminada', [
                'id' => $olimpiada->id,
                'nombre' => $olimpiada->nombre,
                'activo' => $olimpiada->activo
            ]);
        }
    }
}
