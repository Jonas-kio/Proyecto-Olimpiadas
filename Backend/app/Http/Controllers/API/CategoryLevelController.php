<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\CategoryLevelService;
use Exception;
use App\Http\Requests\CategoryLevelRequest\CategoryLevelStoreRequest;
use App\Http\Requests\CategoryLevelRequest\CategoryLevelUpdateRequest;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="Niveles y Categorías",
 *     description="API Endpoints para gestión de niveles y categorías"
 * )
 */

/**
 * @OA\Tag(
 *     name="Niveles y Categorías - Usuario",
 *     description="API Endpoints de niveles y categorías para usuarios normales"
 * )
 */
class CategoryLevelController extends Controller
{
    protected $categoryLevelService;

    public function __construct(CategoryLevelService $categoryLevelService)
    {
        $this->categoryLevelService = $categoryLevelService;
    }

    /**
     * @OA\Get(
     *     path="/api/categoryLevel",
     *     tags={"Niveles y Categorías"},
     *     summary="Obtener todos los niveles y categorías",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de niveles y categorías",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Niveles/categoría obtenidos exitosamente"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/CategoryLevel")
     *             )
     *         )
     *     )
     * )
     */
    public function index()
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

    /**
     * @OA\Get(
     *     path="/api/user/categoryLevel",
     *     tags={"Niveles y Categorías - Usuario"},
     *     summary="Obtener niveles disponibles",
     *     description="Obtiene la lista de niveles disponibles para usuarios normales",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de niveles obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/CategoryLevel")
     *             )
     *         )
     *     )
     * )
     */
    public function indexUser()
    {
        try {
            $categoryLevels = $this->categoryLevelService->getAllCategoryLevels();
            return response()->json([
                'success' => true,
                'data' => $categoryLevels
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los niveles/categoría: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/user/categoryLevel/{category_id}/{area_id}",
     *     tags={"Niveles y Categorías - Usuario"},
     *     summary="Obtener categoría específica por ID y área",
     *     description="Obtiene un nivel específico según el área seleccionada",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="area_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Categoría encontrada",
     *         @OA\JsonContent(ref="#/components/schemas/CategoryLevel")
     *     )
     * )
     */
    public function getCategoryByIdAndAreaId($categoryId, $areaId)
    {
        try {

            $category = $this->categoryLevelService->getCategoryByIdAndAreaId($categoryId, $areaId);

            return response()->json([
                'success' => true,
                'data' => $category
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/categoryLevel",
     *     tags={"Niveles y Categorías"},
     *     summary="Crear nuevo nivel/categoría",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CategoryLevel")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Nivel/categoría creado exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/CategoryLevel")
     *     )
     * )
     */
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

    /**
     * @OA\Put(
     *     path="/api/categoryLevel/{id}",
     *     tags={"Niveles y Categorías"},
     *     summary="Actualizar nivel/categoría",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CategoryLevel")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Nivel/categoría actualizado exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/CategoryLevel")
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/user/categoryLevel/area/{area_id}",
     *     tags={"Niveles y Categorías - Usuario"},
     *     summary="Obtener categorías por área",
     *     description="Obtiene todas las categorías asociadas a un área específica",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="area_id",
     *         in="path",
     *         required=true,
     *         description="ID del área",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de categorías del área",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/CategoryLevel")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No se encontraron categorías para el área",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No existen categorías relacionadas a esta área")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error del servidor",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error al obtener los niveles/categoría")
     *         )
     *     )
     * )
     */
    public function getCategoryByAreaId($areaId)
    {
        try {
            Log::info('Obteniendo categorías por área', ['area_id' => $areaId]);
            if (!is_numeric($areaId) || $areaId <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID de área inválido'
                ], 400);
            }

            $categoryLevels = $this->categoryLevelService->getCategoryByAreaId($areaId);
            return response()->json([
                'success' => true,
                'data' => $categoryLevels
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $code ? $code : 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/categoryLevel/{id}",
     *     tags={"Niveles y Categorías"},
     *     summary="Eliminar nivel/categoría",
     *     description="Elimina un nivel o categoría específica",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del nivel/categoría a eliminar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Nivel/categoría eliminado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Nivel/categoría eliminado exitosamente")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Nivel/categoría no encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Nivel de categoría no encontrado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error del servidor",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error al eliminar el nivel/categoría")
     *         )
     *     )
     * )
     */

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
