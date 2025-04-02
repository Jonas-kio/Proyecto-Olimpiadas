<?php

namespace App\Services;

use App\Models\CategoryLevel;
use Illuminate\Support\Facades\DB;
use Exception;

use App\Enums\GradeName;

class CategoryLevelService
{

    public function getAllCategoryLevels()
    {
        return CategoryLevel::with('area')->get();
        // return CategoryLevel::all();
    }


    public function getCategoryLevelById($id)
    {
        return CategoryLevel::find($id);
    }

    public function createCategoryLevel(array $data)
    {
        try {
            DB::beginTransaction();

            $areaService = new AreaService();
            $area = $areaService->getAreaById($data['area_id']);

            if (!$area) {
                throw new \InvalidArgumentException('Área no encontrada');
            }

            if (!GradeName::isValid($data['grade_name'])) {
                throw new \InvalidArgumentException('Nombre de grado inválido');
            }

            $categoryLevel = CategoryLevel::create([
                'area_id' => $data['area_id'],
                'grade_name' => $data['grade_name'],
                'name' => $data['name'],
                'description' => $data['description'],
                'grade_min' => $data['grade_min'],
                'grade_max' => $data['grade_max'] ?? null
            ]);

            DB::commit();
            return $categoryLevel;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateCategoryLevel($id, array $data)
    {
        try {
            DB::beginTransaction();

            $categoryLevel = $this->getCategoryLevelById($id);

            if (!$categoryLevel) {
                throw new \Exception('Nivel de categoría no encontrado', 404);
            }

            if (isset($data['area_id'])) {
                $areaService = new AreaService();
                $area = $areaService->getAreaById($data['area_id']);

                if (!$area) {
                    throw new \InvalidArgumentException('Área no encontrada');
                }
            }

            if (isset($data['grade_name']) && !GradeName::isValid($data['grade_name'])) {
                throw new \InvalidArgumentException('Nombre de grado inválido');
            }

            $categoryLevel->fill($data);
            $categoryLevel->save();

            DB::commit();
            return $categoryLevel;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }


    public function deleteCategoryLevel($id)
    {
        $categoryLevel = $this->getCategoryLevelById($id);

        if (!$categoryLevel) {
            throw new \Exception('Nivel de categoría no encontrado', 404);
        }

        return $categoryLevel->delete();
    }
}
