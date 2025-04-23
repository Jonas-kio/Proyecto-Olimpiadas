<?php

namespace App\Services;

use App\Models\Area;
use Illuminate\Support\Facades\DB;
use Exception;

class AreaService
{
    /**
     * Obtener todas las áreas.
     */
    public function getAllAreas()
    {
        // return Area::all();
        return Area::where('activo', true)->get(); // solo si manejas el campo 'activo'

    }

    /**
     * Obtener áreas por estado.
     */
    public function getAreasByStatus($status)
    {
        return Area::where('activo', $status)->get();
    }

    /**
     * Obtener un área por ID.
     */
    public function getAreaById($id)
    {
        return Area::find($id);
    }

    /**
     * Crear una nueva área.
     */
    public function createArea(array $data)
    {
        try {
            DB::beginTransaction();

            $area = Area::create([
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion'],
                'activo' => true
            ]);

            DB::commit();
            return $area;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Actualizar un área existente.
     */
    public function updateArea($id, array $data)
    {
        try {
            DB::beginTransaction();

            $area = Area::find($id);

            if (!$area) {
                throw new Exception("Área no encontrada", 404);
            }

            $area->update([
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion']
            ]);

            DB::commit();
            return $area;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Cambiar el estado de un área.
     */
    public function changeAreaStatus($id, $status)
    {
        try {
            DB::beginTransaction();

            $area = Area::find($id);

            if (!$area) {
                throw new Exception("Área no encontrada", 404);
            }

            $area->update(['activo' => $status]);

            DB::commit();
            return $area;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Eliminar físicamente un área.
     */
    public function deleteArea($id)
    {
        try {
            DB::beginTransaction();

            $area = Area::find($id);

            if (!$area) {
                throw new Exception("Área no encontrada", 404);
            }

            // Eliminación física
            $area->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
