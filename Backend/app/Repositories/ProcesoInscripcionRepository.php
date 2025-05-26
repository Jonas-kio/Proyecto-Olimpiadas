<?php

namespace App\Repositories;

use App\Models\Competitor;
use App\Models\RegistrationProcess;
use App\Enums\EstadoInscripcion;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ProcesoInscripcionRepository
{
    public function crear(array $datos)
    {
        if (isset($datos['status']) && $datos['status'] instanceof EstadoInscripcion) {
            $datos['status'] = $datos['status']->value;
        }

        return RegistrationProcess::create($datos);
    }

    public function agregarCompetidor(int $procesoId, int $competidorId)
    {
        $cacheKey = "proceso_{$procesoId}_competidores";

        $competidoresIds = Cache::get($cacheKey, []);
        if (!in_array($competidorId, $competidoresIds)) {
            $competidoresIds[] = $competidorId;
        }

        Cache::put($cacheKey, $competidoresIds, now()->addHours(24));

        if (Session::has('competidores_ids')) {
            $sessionIds = Session::get('competidores_ids', []);
            if (!in_array($competidorId, $sessionIds)) {
                $sessionIds[] = $competidorId;
                Session::put('competidores_ids', $sessionIds);
            }
        }

        return true;
    }

    public function competidorPerteneceAProceso(int $procesoId, int $competidorId)
    {
        $cacheKey = "proceso_{$procesoId}_competidores";
        $competidoresIds = Cache::get($cacheKey, []);

        return in_array($competidorId, $competidoresIds);
    }

    public function obtenerIdsCompetidores(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_competidores";
        return Cache::get($cacheKey, []);
    }

    public function obtenerCompetidores(int $procesoId)
    {
        $competidoresIds = $this->obtenerIdsCompetidores($procesoId);

        if (empty($competidoresIds)) {
            return collect();
        }

        return Competitor::with('tutores')
            ->whereIn('id', $competidoresIds)
            ->get();
    }

    public function guardarSeleccionArea(int $procesoId, int $areaId)
    {
        // Guardar el área individual seleccionada (mantener por compatibilidad)
        $cacheKey = "proceso_{$procesoId}_area";
        Cache::put($cacheKey, $areaId, now()->addHours(24));
        Log::info("Área guardada en caché para el proceso {$procesoId}: {$areaId}");

        // También guardar en la colección de áreas seleccionadas
        $areasKey = "proceso_{$procesoId}_areas";
        $areas = Cache::get($areasKey, []);

        if (!in_array($areaId, $areas)) {
            $areas[] = $areaId;
            Cache::put($areasKey, $areas, now()->addHours(24));
            Log::info("Área agregada a la lista de seleccionadas para el proceso {$procesoId}: {$areaId}");
        }

        if (Session::has('area_id')) {
            Session::put('area_id', $areaId);
        }

        return true;
    }

    public function guardarSeleccionNivel(int $procesoId, int $nivelId)
    {
        // Guardar el nivel individual seleccionado (para compatibilidad)
        $cacheKey = "proceso_{$procesoId}_nivel";
        Cache::put($cacheKey, $nivelId, now()->addHours(24));

        // También guardar en la colección de niveles seleccionados
        $nivelesKey = "proceso_{$procesoId}_niveles";
        $niveles = Cache::get($nivelesKey, []);

        if (!in_array($nivelId, $niveles)) {
            $niveles[] = $nivelId;
            Cache::put($nivelesKey, $niveles, now()->addHours(24));
            Log::info("Nivel agregado a la lista de seleccionados para el proceso {$procesoId}: {$nivelId}");
        }

        if (Session::has('nivel_id')) {
            Session::put('nivel_id', $nivelId);
        }

        return true;
    }

    public function actualizarEstadoActivacion(int $procesoId, bool $activo)
    {
        $proceso = RegistrationProcess::findOrFail($procesoId);
        $proceso->active = $activo;
        $resultado = $proceso->save();

        if ($resultado) {
            Log::info("Proceso {$procesoId} - Estado de activación actualizado a: " . ($activo ? 'activo' : 'inactivo'));
        } else {
            Log::error("Error al actualizar estado de activación del proceso {$procesoId}");
        }

        return $resultado;
    }

    public function obtenerAreaSeleccionada(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_area";
        return Cache::get($cacheKey);
    }

    public function obtenerNivelSeleccionado(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_nivel";
        return Cache::get($cacheKey);
    }

    public function obtenerAreasSeleccionadas(int $procesoId)
    {
        $areasKey = "proceso_{$procesoId}_areas";
        return Cache::get($areasKey, []);
    }

    public function obtenerNivelesSeleccionados(int $procesoId)
    {
        $nivelesKey = "proceso_{$procesoId}_niveles";
        return Cache::get($nivelesKey, []);
    }

    public function obtenerEstadoProceso(int $procesoId)
    {
        $proceso = RegistrationProcess::find($procesoId);
        if ($proceso) {
            return $proceso->status;
        }
        return null;
    }

    /**
     * Obtiene un proceso por su ID y asegura que esté activo
     *
     * @param int $procesoId ID del proceso
     * @return RegistrationProcess|null Proceso encontrado o null
     */
    public function obtenerProcesoActivo(int $procesoId)
    {
        return RegistrationProcess::where('id', $procesoId)
            ->where('active', true)
            ->first();
    }
}
