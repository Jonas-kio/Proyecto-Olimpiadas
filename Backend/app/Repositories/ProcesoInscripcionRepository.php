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
        // Guardar el área individual seleccionada
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
        $cacheKey = "proceso_{$procesoId}_nivel";

        Cache::put($cacheKey, $nivelId, now()->addHours(24));

        if (Session::has('nivel_id')) {
            Session::put('nivel_id', $nivelId);
        }

        return true;
    }

    public function obtenerAreaSeleccionada(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_area";
        $area_id = Cache::get($cacheKey);
        Log::info("Área recuperada de la caché para el proceso areaID: {$area_id}");
        return $area_id;
    }

    public function obtenerAreasSeleccionadas(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_areas";
        $areas = Cache::get($cacheKey, []);

        // Si no hay áreas en caché bajo la clave 'areas', verificar si hay un área individual seleccionada
        if (empty($areas)) {
            $areaId = $this->obtenerAreaSeleccionada($procesoId);
            if ($areaId) {
                $areas = [$areaId];
                // Almacenar en caché para futuras consultas
                Cache::put($cacheKey, $areas, now()->addHours(24));
            }
        }

        return $areas;
    }

    public function obtenerNivelSeleccionado(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_nivel";
        return Cache::get($cacheKey);
    }

    public function limpiarDatosProceso(int $procesoId)
    {
        $prefijo = "proceso_{$procesoId}_";

        Cache::forget("{$prefijo}competidores");
        Cache::forget("{$prefijo}area");
        Cache::forget("{$prefijo}nivel");

        Session::forget('competidores_ids');
        Session::forget('area_id');
        Session::forget('nivel_id');

        return true;
    }

    public function obtenerEstadoProceso($procesoId)
    {
        $proceso = RegistrationProcess::find($procesoId);
        if ($proceso) {
            return $proceso->status;
        }
        return null;
    }
}
