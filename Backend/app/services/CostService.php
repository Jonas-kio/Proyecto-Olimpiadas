<?php

namespace App\Services;

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

        return Cost::find($id);
    }


    public function createCost(array $data)
    {
        try {
            DB::beginTransaction();

            $cost = new Cost();
            $cost->area_id = $data['area_id'];
            $cost->category_id = $data['category_id'];
            $cost->name = $data['name'];
            $cost->price = $data['price'];
            $cost->save();

            DB::commit();
            return $cost;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateCost($id, array $data)
    {
        try {
            DB::beginTransaction();

            $cost = Cost::findOrFail($id);

            if (isset($data['name'])) {
                $cost->name = $data['name'];
            }

            if (isset($data['price'])) {
                $cost->price = $data['price'];
            }

            $cost->save();

            DB::commit();
            return $cost;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }


    public function deleteCost($id)
    {
        try {
            DB::beginTransaction();

            $cost = Cost::find($id);

            if (!$cost) {
                return false;
            }

            $deletedCost = [
                'id' => $cost->id,
                'name' => $cost->name,
                'status' => 'deleted'
            ];

            $cost->delete();

            DB::commit();
            return $deletedCost;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
