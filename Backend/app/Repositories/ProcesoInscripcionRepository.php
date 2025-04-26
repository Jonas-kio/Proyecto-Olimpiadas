<?php

namespace App\Repositories;

use App\Models\Competitor;
use App\Models\ProcesoInscripcion;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;

class ProcesoInscripcionRepository
{
    /**
     * Crear un nuevo proceso de inscripción
     */
    public function crear(array $datos)
    {
        return ProcesoInscripcion::create($datos);
    }

    /**
     * Agregar un competidor al proceso de inscripción
     * Almacena temporalmente en caché/sesión para luego crear los registros definitivos
     */
    public function agregarCompetidor(int $procesoId, int $competidorId)
    {
        $cacheKey = "proceso_{$procesoId}_competidores";
        
        $competidoresIds = Cache::get($cacheKey, []);
        $competidoresIds[] = $competidorId;
        
        // Almacenar por 24 horas (suficiente para completar un proceso)
        Cache::put($cacheKey, $competidoresIds, now()->addHours(24));
        
        // Si también se está usando en sesión para el frontend
        if (Session::has('competidores_ids')) {
            $sessionIds = Session::get('competidores_ids', []);
            $sessionIds[] = $competidorId;
            Session::put('competidores_ids', $sessionIds);
        }
        
        return true;
    }

    /**
     * Verificar si un competidor pertenece a un proceso
     */
    public function competidorPerteneceAProceso(int $procesoId, int $competidorId)
    {
        $cacheKey = "proceso_{$procesoId}_competidores";
        $competidoresIds = Cache::get($cacheKey, []);
        
        return in_array($competidorId, $competidoresIds);
    }

    /**
     * Obtener los IDs de los competidores asociados a un proceso
     */
    public function obtenerIdsCompetidores(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_competidores";
        return Cache::get($cacheKey, []);
    }

    /**
     * Obtener los competidores completos asociados a un proceso
     */
    public function obtenerCompetidores(int $procesoId)
    {
        $competidoresIds = $this->obtenerIdsCompetidores($procesoId);
        
        if (empty($competidoresIds)) {
            return collect();
        }
        
        return Competitor::with(['colegio', 'tutores'])
            ->whereIn('id', $competidoresIds)
            ->get();
    }

    /**
     * Guardar la selección de área en el proceso
     */
    public function guardarSeleccionArea(int $procesoId, int $areaId)
    {
        $cacheKey = "proceso_{$procesoId}_area";
        Cache::put($cacheKey, $areaId, now()->addHours(24));
        
        // Si también se está usando en sesión para el frontend
        if (Session::has('area_id')) {
            Session::put('area_id', $areaId);
        }
        
        return true;
    }

    /**
     * Guardar la selección de nivel en el proceso
     */
    public function guardarSeleccionNivel(int $procesoId, int $nivelId)
    {
        $cacheKey = "proceso_{$procesoId}_nivel";
        Cache::put($cacheKey, $nivelId, now()->addHours(24));
        
        // Si también se está usando en sesión para el frontend
        if (Session::has('nivel_id')) {
            Session::put('nivel_id', $nivelId);
        }
        
        return true;
    }

    /**
     * Obtener el área seleccionada para un proceso
     */
    public function obtenerAreaSeleccionada(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_area";
        return Cache::get($cacheKey);
    }

    /**
     * Obtener el nivel seleccionado para un proceso
     */
    public function obtenerNivelSeleccionado(int $procesoId)
    {
        $cacheKey = "proceso_{$procesoId}_nivel";
        return Cache::get($cacheKey);
    }

    /**
     * Limpiar todos los datos temporales de un proceso
     */
    public function limpiarDatosProceso(int $procesoId)
    {
        $prefijo = "proceso_{$procesoId}_";
        
        // Limpiar caché
        Cache::forget("{$prefijo}competidores");
        Cache::forget("{$prefijo}area");
        Cache::forget("{$prefijo}nivel");
        
        // Limpiar sesión
        Session::forget('competidores_ids');
        Session::forget('area_id');
        Session::forget('nivel_id');
        
        return true;
    }
}