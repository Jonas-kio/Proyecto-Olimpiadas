<?php

use App\Http\Controllers\CostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/costs', [CostController::class, 'index']);
Route::post('/costs', [CostController::class, 'store']);
Route::put('/costs/{cost}', [CostController::class, 'update']);
Route::delete('/costs/{cost}', [CostController::class, 'destroy']);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
