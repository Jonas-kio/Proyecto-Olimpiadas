<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\AreaStoreRequest;
use App\Http\Requests\AreaUpdateRequest;
use App\Services\AreaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * @OA\Tag(
 *     name="Áreas",
 *     description="API Endpoints para gestión de áreas de competencia"
 * )
 */
class AreaController extends Controller
{
    protected $areaService;

    public function __construct(AreaService $areaService)
    {
        $this->areaService = $areaService;
    }
    /**
     * @OA\Get(
     *     path="/api/area",
     *     tags={"Áreas"},
     *     summary="Obtener lista de áreas",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="activo",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="boolean"),
     *         description="Filtrar áreas por estado activo/inactivo"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de áreas obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Area")
     *             )
     *         )
     *     )
     * )
     *
     * @OA\Get(
     *     path="/api/user/areas",
     *     tags={"Áreas"},
     *     summary="Obtener lista de áreas (ruta alternativa para usuarios)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="activo",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="boolean"),
     *         description="Filtrar áreas por estado activo/inactivo"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de áreas obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Area")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        try {
            if ($request->has('activo')) {
                $activo = filter_var($request->activo, FILTER_VALIDATE_BOOLEAN);
                $areas = $this->areaService->getAreasByStatus($activo);
            } else {
                $areas = $this->areaService->getAllAreas();
            }

            return response()->json([
                'success' => true,
                'data' => $areas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las áreas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/area",
     *     tags={"Áreas"},
     *     summary="Crear nueva área",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre"},
     *             @OA\Property(property="nombre", type="string", example="Matemáticas"),
     *             @OA\Property(property="descripcion", type="string", example="Área de matemáticas y lógica")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Área creada exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Area")
     *     )
     * )
     */
    public function store(AreaStoreRequest $request)
    {
        try {
            $area = $this->areaService->createArea($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Área de competencia creada exitosamente',
                'data' => $area
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/area/{id}",
     *     tags={"Áreas"},
     *     summary="Obtener área específica",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Área encontrada",
     *         @OA\JsonContent(ref="#/components/schemas/Area")
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $area = $this->areaService->getAreaById($id);

            if (!$area) {
                return response()->json([
                    'success' => false,
                    'message' => 'Área de competencia no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $area
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/area/{id}",
     *     tags={"Áreas"},
     *     summary="Actualizar área",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/Area")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Área actualizada exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Area")
     *     )
     * )
     */
    public function update(AreaUpdateRequest $request, $id)
    {
        try {
            $area = $this->areaService->updateArea($id, $request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Área de competencia actualizada exitosamente',
                'data' => $area
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
                'message' => 'Error al actualizar el área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Patch(
     *     path="/api/area/{id}/status",
     *     tags={"Áreas"},
     *     summary="Cambiar estado de un área",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Estado del área actualizado exitosamente"
     *     )
     * )
     */
    public function changeStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'activo' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $area = $this->areaService->changeAreaStatus($id, $request->activo);

            $statusText = $request->activo ? 'activada' : 'desactivada';

            return response()->json([
                'success' => true,
                'message' => "Área de competencia {$statusText} exitosamente",
                'data' => $area
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
                'message' => 'Error al cambiar el estado del área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar físicamente un área de competencia.
     */
    public function destroy($id)
    {
        try {
            $this->areaService->deleteArea($id);
            return response()->json([
                'success' => true,
                'message' => 'Área de competencia eliminada exitosamente'
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
                'message' => 'Error al eliminar el área: ' . $e->getMessage()
            ], 500);
        }
    }
}
