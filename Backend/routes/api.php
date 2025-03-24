<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AreaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas para Áreas de Competencia
Route::apiResource('areas', AreaController::class);

// Ruta para cambiar el estado de un área
Route::patch('areas/{id}/status', [AreaController::class, 'changeStatus']);
