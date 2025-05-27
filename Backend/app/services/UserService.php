<?php

namespace App\Services;

use App\Models\Area;
use Illuminate\Support\Facades\DB;
use Exception;

class UserService
{

    public function getAllUsers()
    {
        return Area::all();
    }

    public function getAreasByStatus($status)
    {
        return Area::where('activo', $status)->get();
    }

    public function getAreaById($id)
    {
        return Area::find($id);
    }

    public function createUser(array $data)
    {
        try {
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


            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
