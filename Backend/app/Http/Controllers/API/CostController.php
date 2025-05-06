<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Exception;
use App\Http\Requests\RequestCost\CostStoreRequest;
use App\Http\Requests\RequestCost\CostUpdateRequest;
use App\Services\CostService;

/**
 * @OA\Tag(
 *     name="Costos",
 *     description="API Endpoints para gestión de costos"
 * )
 */
class CostController extends Controller
{
    protected $costService;

    public function __construct(CostService $costService)
    {
        $this->costService = $costService;
    }

    /**
     * @OA\Get(
     *     path="/api/costs",
     *     tags={"Costos"},
     *     summary="Obtener lista de costos",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de costos obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Cost")
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        try {
            $costs = $this->costService->getAllCosts();
            return response()->json([
                'success' => true,
                'data' => $costs
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los costos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $cost = $this->costService->getCostById($id);

            if (!$cost) {
                return response()->json([
                    'success' => false,
                    'message' => 'Costo no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $cost
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el costo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/costs",
     *     tags={"Costos"},
     *     summary="Crear nuevo costo",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"monto","area_id"},
     *             @OA\Property(property="monto", type="number", format="float", example=150.00),
     *             @OA\Property(property="area_id", type="integer", example=1),
     *             @OA\Property(property="descripcion", type="string", example="Costo de inscripción área matemáticas")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Costo creado exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Cost")
     *     )
     * )
     */
    public function store(CostStoreRequest $request)
    {
        try {
            $validated = $request->validated();
            $cost = $this->costService->createCost($validated);

            return response()->json([
                'success' => true,
                'message' => 'Costo creado exitosamente',
                'data' => $cost
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el costo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/costs/{cost}",
     *     tags={"Costos"},
     *     summary="Actualizar costo existente",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="cost",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/Cost")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Costo actualizado exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Cost")
     *     )
     * )
     */
    public function update(CostUpdateRequest $request, $id)
    {
        try {
            $validated = $request->validated();
            $cost = $this->costService->updateCost($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Costo actualizado exitosamente',
                'data' => $cost
            ]);
        } catch (Exception $e) {
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Costo no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el costo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/costs/{cost}",
     *     tags={"Costos"},
     *     summary="Eliminar costo",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="cost",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Costo eliminado exitosamente"
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            $result = $this->costService->deleteCost($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Costo no encontrado o no se pudo eliminar'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Costo eliminado exitosamente',
                'result' => $result
            ]);
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Costo no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el costo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
