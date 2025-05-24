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
        return Olimpiada::with(['areas', 'conditions.area'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createOlimpiada(
        array $data,
        ?UploadedFile $pdfDetalles = null,
        ?UploadedFile $imagenPortada = null,
        ?array $areas = [],
        ?array $condiciones = []
    ): Olimpiada {
        Log::info('Iniciando creación de olimpiada', [
            'datos_recibidos' => array_keys($data),
            'tiene_pdf' => $pdfDetalles !== null,
            'tiene_imagen' => $imagenPortada !== null,
            'cantidad_areas' => count($areas)
        ]);

        // Escribir directamente a un archivo para depuración
        return DB::transaction(function () use ($data, $pdfDetalles, $imagenPortada, $areas, $condiciones) {
            try {
                Log::info('Procesando fechas y estado', [
                    'fecha_inicio' => $data['fecha_inicio'] ?? null,
                    'fecha_fin' => $data['fecha_fin'] ?? null
                ]);

                $dataEstado = $this->determinarEstado($data['fecha_inicio'], $data['fecha_fin']);
                $data['estado'] = $dataEstado['estado'];
                $data['activo'] = $dataEstado['activo'];

                // Asegurar que maximo_areas sea un entero válido (mínimo 1)
                $data['maximo_areas'] = isset($data['maximo_areas']) ? max(1, (int)$data['maximo_areas']) : 1;

                Log::info('Creando olimpiada con datos', [
                    'estado' => $data['estado'],
                    'activo' => $data['activo'],
                    'areas' => $areas,
                    'maximo_areas' => $data['maximo_areas'],
                    'condiciones' => $condiciones
                ]);

                $olimpiada = Olimpiada::create($data);
                Log::info('Olimpiada creada en la base de datos', [
                    'id' => $olimpiada->id,
                    'nombre' => $olimpiada->nombre
                ]);

                $this->handleFileUploads($olimpiada, $pdfDetalles, $imagenPortada);
                $this->handleAreas($olimpiada, $areas);
                $this->handleConditions($olimpiada, $areas, $condiciones);

                $olimpiada->refresh();
                $this->logOlimpiadaOperation($olimpiada, 'creada');

                return $olimpiada;
            } catch (\Exception $e) {
                Log::error('Error al crear olimpiada', [
                    'error' => $e->getMessage(),
                    'linea' => $e->getLine(),
                    'archivo' => $e->getFile()
                ]);
                Log::error($e->getTraceAsString());
                throw $e;
            }
        });
    }

    private function handleConditions(Olimpiada $olimpiada, array $areas, ?array $condiciones): void
    {
        if (empty($areas)) {
            Log::warning('No hay áreas para crear condiciones', ['olimpiada_id' => $olimpiada->id]);
            return;
        }

        Log::info('Procesando condiciones para olimpiada', [
            'olimpiada_id' => $olimpiada->id,
            'areas' => $areas,
            'maximo_areas' => $olimpiada->maximo_areas,
            'condiciones' => $condiciones
        ]);

        $condicionesCreadas = [];

        foreach ($areas as $areaId) {
            $condicionArea = null;
            if (!empty($condiciones)) {
                $condicionArea = collect($condiciones)->first(function ($condicion) use ($areaId) {
                    return isset($condicion['area_id']) && $condicion['area_id'] == $areaId;
                });

                Log::info('Buscando condición para área', [
                    'area_id' => $areaId,
                    'condicion_encontrada' => !is_null($condicionArea),
                    'condicion_data' => $condicionArea
                ]);
            }

            $nuevaCondicion = [
                'area_id' => $areaId,
                'nivel_unico' => $condicionArea['nivel_unico'] ?? false,
                'area_exclusiva' => $condicionArea['area_exclusiva'] ?? false,
            ];

            $condicion = $olimpiada->conditions()->create($nuevaCondicion);
            $condicionesCreadas[] = $condicion->toArray();

            Log::info('Condición creada para área', [
                'olimpiada_id' => $olimpiada->id,
                'area_id' => $areaId,
                'condicion_id' => $condicion->id,
                'nivel_unico' => $condicion->nivel_unico,
                'area_exclusiva' => $condicion->area_exclusiva,
                'tiene_condiciones_especificas' => !is_null($condicionArea)
            ]);
        }

        Log::info('Todas las condiciones creadas para la olimpiada', [
            'olimpiada_id' => $olimpiada->id,
            'total_condiciones' => count($condicionesCreadas),
            'condiciones' => $condicionesCreadas
        ]);
    }

    public function updateOlimpiada(
        Olimpiada $olimpiada,
        array $data,
        ?UploadedFile $pdfDetalles = null,
        ?UploadedFile $imagenPortada = null,
        ?array $areas = null,
        ?array $condiciones = null
    ): Olimpiada {
        return DB::transaction(function () use ($olimpiada, $data, $pdfDetalles, $imagenPortada, $areas,$condiciones) {
            $this->logUpdateStart($olimpiada, $data, $areas, $pdfDetalles, $imagenPortada);

            $this->processModalidad($data);
            $this->processActivo($data);
            $this->processMaximoAreas($data);

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

            if ($areas !== null && $condiciones !== null) {
                $this->updateConditions($olimpiada, $areas, $condiciones);
            }

            $olimpiada->refresh();
            $this->logOlimpiadaOperation($olimpiada, 'actualizada');

            return $olimpiada;
        });
    }

    private function updateConditions(Olimpiada $olimpiada, array $areas, array $condiciones): void
    {
        // Eliminar condiciones antiguas que ya no están en las áreas seleccionadas
        $olimpiada->conditions()->whereNotIn('area_id', $areas)->delete();

        foreach ($areas as $areaId) {
            $condicionArea = collect($condiciones)->first(function ($condicion) use ($areaId) {
                return isset($condicion['area_id']) && $condicion['area_id'] == $areaId;
            });

            $olimpiada->conditions()->updateOrCreate(
                [
                    'area_id' => $areaId,
                ],
                [
                    'nivel_unico' => $condicionArea['nivel_unico'] ?? false,
                    'area_exclusiva' => $condicionArea['area_exclusiva'] ?? false,
                ]
            );
        }

        Log::info('Condiciones actualizadas', [
            'olimpiada_id' => $olimpiada->id,
            'maximo_areas' => $olimpiada->maximo_areas,
            'areas' => $areas,
            'condiciones' => $condiciones
        ]);
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
        Log::info('Iniciando carga de archivos', [
            'olimpiada_id' => $olimpiada->id,
            'tiene_pdf' => $pdfDetalles !== null,
            'tiene_imagen' => $imagenPortada !== null
        ]);

        if ($pdfDetalles) {
            try {
                Log::info('Subiendo PDF de detalles', [
                    'nombre_original' => $pdfDetalles->getClientOriginalName(),
                    'tamaño' => $pdfDetalles->getSize(),
                    'mime' => $pdfDetalles->getMimeType()
                ]);

                $olimpiada->ruta_pdf_detalles = $this->uploadFile($pdfDetalles, self::PDF_DIRECTORY, $olimpiada->ruta_pdf_detalles);

                Log::info('PDF subido correctamente', [
                    'ruta' => $olimpiada->ruta_pdf_detalles
                ]);
            } catch (\Exception $e) {
                Log::error('Error al subir PDF', [
                    'error' => $e->getMessage(),
                    'linea' => $e->getLine()
                ]);
                throw $e;
            }
        }

        if ($imagenPortada) {
            try {
                Log::info('Subiendo imagen de portada', [
                    'nombre_original' => $imagenPortada->getClientOriginalName(),
                    'tamaño' => $imagenPortada->getSize(),
                    'mime' => $imagenPortada->getMimeType()
                ]);

                $olimpiada->ruta_imagen_portada = $this->uploadFile($imagenPortada, self::IMAGE_DIRECTORY, $olimpiada->ruta_imagen_portada);

                Log::info('Imagen subida correctamente', [
                    'ruta' => $olimpiada->ruta_imagen_portada
                ]);
            } catch (\Exception $e) {
                Log::error('Error al subir imagen', [
                    'error' => $e->getMessage(),
                    'linea' => $e->getLine()
                ]);
                throw $e;
            }
        }

        if ($olimpiada->isDirty(['ruta_pdf_detalles', 'ruta_imagen_portada'])) {
            Log::info('Guardando rutas de archivos en la olimpiada', [
                'cambios' => $olimpiada->getDirty()
            ]);
            $olimpiada->save();
        }
    }

    private function uploadFile(UploadedFile $file, string $directory, ?string $oldPath = null): string
    {
        Log::info('Iniciando subida de archivo', [
            'directorio' => $directory,
            'tiene_path_anterior' => $oldPath !== null
        ]);

        if ($oldPath) {
            try {
                Log::info('Eliminando archivo anterior', ['path' => $oldPath]);
                Storage::disk('public')->delete($oldPath);
            } catch (\Exception $e) {
                Log::warning('No se pudo eliminar el archivo anterior', [
                    'path' => $oldPath,
                    'error' => $e->getMessage()
                ]);
            }
        }

        try {
            $path = Storage::disk('public')->putFile($directory, $file);
            Log::info('Archivo subido con éxito', [
                'path' => $path,
                'directorio' => $directory
            ]);
            return $path;
        } catch (\Exception $e) {
            Log::error('Error al subir archivo', [
                'directorio' => $directory,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function handleAreas(Olimpiada $olimpiada, ?array $areas): void
    {
        if ($areas === null) {
            Log::info('No se han proporcionado áreas para actualizar', [
                'olimpiada_id' => $olimpiada->id
            ]);
            return;
        }

        Log::info('Procesando áreas para olimpiada', [
            'olimpiada_id' => $olimpiada->id,
            'areas_recibidas' => $areas,
            'cantidad_areas' => count($areas)
        ]);

        $this->logAreasUpdate($areas);

        try {
            if (!empty($areas)) {
                Log::info('Sincronizando áreas con la olimpiada', [
                    'olimpiada_id' => $olimpiada->id,
                    'areas' => $areas
                ]);
                $olimpiada->areas()->sync($areas);
                Log::info('Áreas sincronizadas correctamente');
            } else {
                Log::info('Eliminando todas las áreas de la olimpiada', [
                    'olimpiada_id' => $olimpiada->id
                ]);
                $olimpiada->areas()->detach();
                Log::info('Áreas eliminadas correctamente');
            }
        } catch (\Exception $e) {
            Log::error('Error al procesar áreas', [
                'olimpiada_id' => $olimpiada->id,
                'error' => $e->getMessage(),
                'linea' => $e->getLine()
            ]);
            throw $e;
        }
    }

    private function processModalidad(array &$data): void
    {
        if (isset($data['modalidad'])) {
            $valorOriginal = $data['modalidad'];
            $data['modalidad'] = ucfirst(strtolower($data['modalidad']));
            Log::info('Procesando modalidad', [
                'valor_original' => $valorOriginal,
                'valor_procesado' => $data['modalidad']
            ]);
        } else {
            Log::info('No se proporcionó valor para modalidad');
        }
    }

    private function processActivo(array &$data): void
    {
        if (isset($data['activo'])) {
            $valorOriginal = $data['activo'];
            $data['activo'] = filter_var($data['activo'], FILTER_VALIDATE_BOOLEAN);
            Log::info('Procesando activo', [
                'valor_original' => $valorOriginal,
                'valor_procesado' => $data['activo'] ? 'true' : 'false'
            ]);
        } else {
            Log::info('No se proporcionó valor para activo');
        }
    }

    private function processMaximoAreas(array &$data): void
    {
        if (isset($data['maximo_areas'])) {
            $valorOriginal = $data['maximo_areas'];
            $data['maximo_areas'] = max(1, (int)$data['maximo_areas']);
            Log::info('Procesando máximo de áreas', [
                'valor_original' => $valorOriginal,
                'valor_procesado' => $data['maximo_areas']
            ]);
        } else {
            Log::info('No se proporcionó valor para máximo de áreas');
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
            'maximo_areas' => $olimpiada->maximo_areas,
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

        Log::info('Determinando estado de la olimpiada', [
            'fecha_inicio' => $fechaInicio->toDateString(),
            'fecha_fin' => $fechaFin->toDateString(),
            'hoy' => $today->toDateString()
        ]);

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
