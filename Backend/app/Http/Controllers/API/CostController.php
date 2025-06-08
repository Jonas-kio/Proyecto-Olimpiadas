<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Exception;
use App\Http\Requests\RequestCost\CostStoreRequest;
use App\Http\Requests\RequestCost\CostUpdateRequest;
use App\Services\CostService;

class CostController extends Controller
{
    protected $costService;

    public function __construct(CostService $costService)
    {
        $this->costService = $costService;
    }

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
