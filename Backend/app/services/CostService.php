<?php

namespace App\Services;

use App\Models\CategoryLevel;
use App\Models\Cost;
use Illuminate\Support\Facades\DB;
use Exception;


class CostService
{
    public function getAllCosts()
    {

        return Cost::all();
    }


    public function getCostById($id)
    {
        return CategoryLevel::find($id);
    }

    public function createCost(array $data)
    {
        try {
            DB::beginTransaction();

            DB::commit();
            return 0;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateCost($id, array $data)
    {
        try {
            DB::beginTransaction();

            DB::commit();
            return 0;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }


    public function deleteCost($id)
    {

        return 0;
    }
}
