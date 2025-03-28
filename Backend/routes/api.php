<?php

use App\Http\Controllers\CostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\CategoryLevelController;

Route::get('/costs', [CostController::class, 'index']);
Route::post('/costs', [CostController::class, 'store']);
Route::put('/costs/{cost}', [CostController::class, 'update']);
Route::delete('/costs/{cost}', [CostController::class, 'destroy']);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas para Áreas de Competencia
Route::apiResource('area', AreaController::class);

// Ruta para cambiar el estado de un área
Route::patch('area/{id}/status', [AreaController::class, 'changeStatus']);
Route::patch('areas/{id}/status', [AreaController::class, 'changeStatus']);


//Rutas para el controlador  de category_lavel

Route::apiResource('categoryLavel', CategoryLevelController::class);

Route::patch('categoryLavel/{id}', [CategoryLevelController::class, 'update']);
Route::delete('categoryLavel/{id}', [CategoryLevelController::class, 'destroy']);
