<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\CategoryLevelService;
use Illuminate\Http\Request;
use Exception;

use App\Http\Requests\CategoryLevelRequest\CategoryLevelStoreRequest;
use App\Http\Requests\CategoryLevelRequest\CategoryLevelUpdateRequest;

class CategoryLevelController extends Controller
{
    protected $categoryLevelService;

    public function __construct(CategoryLevelService $categoryLevelService)
    {
        $this->categoryLevelService = $categoryLevelService;
    }

    public function index(Request $request)
    {
        try {
            $categoryLevels = $this->categoryLevelService->getAllCategoryLevels();

            if ($categoryLevels->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No se encontraron niveles/categoría',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Niveles/categoría obtenidos exitosamente',
                'data' => $categoryLevels
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los niveles/categoría: ' . $e->getMessage()
            ], 500);
        }
    }


    public function store(CategoryLevelStoreRequest $request)
    {
        try {
            $categoryLevel = $this->categoryLevelService->createCategoryLevel($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Nivel/categoría creado exitosamente',
                'data' => $categoryLevel
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el nivel/categoría: ' . $e->getMessage()
            ], 500);
        }
    }


    public function show($id)
    {
        try {
            $categoryLevel = $this->categoryLevelService->getCategoryLevelById($id);

            if (!$categoryLevel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nivel/categoría no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $categoryLevel
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el nivel/categoría: ' . $e->getMessage()
            ], 500);
        }
    }


    public function update(CategoryLevelUpdateRequest $request, $id)
    {
        try {

            if (!is_numeric($id) || $id <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID de nivel/categoría inválido'
                ], 400);
            }

            $validatedData = $request->validated();

            $categoryLevel = $this->categoryLevelService->updateCategoryLevel($id, $validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Nivel/categoría actualizado exitosamente',
                'data' => $categoryLevel
            ]);
        } catch (\InvalidArgumentException $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {

            if ($e->getCode() == 404) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nivel/categoría no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error interno al actualizar el nivel/categoría'
            ], 500);
        }
    }



    public function destroy($id)
    {
        try {
            $this->categoryLevelService->deleteCategoryLevel($id);
            return response()->json([
                'success' => true,
                'message' => 'Nivel/categoría eliminado exitosamente'
            ]);
        } catch (Exception $e) {
            if ($e->getCode() == 404) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el nivel/categoría: ' . $e->getMessage()
            ], 500);
        }
    }
}
