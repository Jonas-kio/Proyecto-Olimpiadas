<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\CategoryLevelController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas para Áreas de Competencia
Route::apiResource('areas', AreaController::class);

// Ruta para cambiar el estado de un área
Route::patch('areas/{id}/status', [AreaController::class, 'changeStatus']);


//Rutas para el controlador  de category_lavel

Route::apiResource('categoryLavel', CategoryLevelController::class);

Route::patch('categoryLavel/{id}', [CategoryLevelController::class, 'update']);
