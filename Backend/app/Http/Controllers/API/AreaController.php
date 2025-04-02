<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\AreaStoreRequest;
use App\Http\Requests\AreaUpdateRequest;
use App\Services\AreaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class AreaController extends Controller
{
    protected $areaService;

    public function __construct(AreaService $areaService)
    {
        $this->areaService = $areaService;
    }

    /**
     * Mostrar listado de áreas de competencia.
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
     * Mostrar un área de competencia específica.
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
     * Actualizar un área de competencia.
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
     * Cambiar el estado de un área de competencia.
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
