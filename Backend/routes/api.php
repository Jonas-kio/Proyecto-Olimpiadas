<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CostController;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryLevelController;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsUserAuth;

//TODO: Rutas Publicas
/* Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

//TODO: Rutas Privadas
Route::middleware([IsUserAuth::class])->group(
    function () {
        Route::controller(AuthController::class)->group(
            function () {
                Route::post('logout', 'logout');
                Route::get('me', 'getUser');
            }
        );

        Route::middleware([IsAdmin::class])->group(
            function () {
                // Rutas para configuración de áreas
                Route::apiResource('area', AreaController::class);
                Route::patch('area/{id}/status', [AreaController::class, 'changeStatus']);
                Route::patch('areas/{id}/status', [AreaController::class, 'changeStatus']);

                // Rutas para configuración de Niveles/Categoría
                Route::apiResource('categoryLavel', CategoryLevelController::class);
                Route::patch('categoryLavel/{id}', [CategoryLevelController::class, 'update']);
                Route::delete('categoryLavel/{id}', [CategoryLevelController::class, 'destroy']);

                // Rutas para configuración de costos
                Route::controller(CostController::class)->group(function () {
                    Route::get('/costs', 'index');
                    Route::post('/costs', 'store');
                    Route::put('/costs/{cost}', 'update');
                    Route::delete('/costs/{cost}', 'destroy');
                });

                // Mas Rutas de Admin ........
            }
        );

        //TODO: Rutas Para Usuario que no es administrador
        //....... AQUI!!!
    }
); */


//Rutas para Costos
/* 
Route::get('/costs', [CostController::class, 'index']);
Route::post('/costs', [CostController::class, 'store']);
Route::put('/costs/{cost}', [CostController::class, 'update']);
Route::delete('/costs/{cost}', [CostController::class, 'destroy']);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum'); 
*/

 // Rutas para Áreas de Competencia
Route::apiResource('area', AreaController::class);

// Ruta para cambiar el estado de un área
Route::patch('area/{id}/status', [AreaController::class, 'changeStatus']);
Route::patch('areas/{id}/status', [AreaController::class, 'changeStatus']);
 

//Rutas para el controlador  de category_lavel
/* 
Route::apiResource('categoryLavel', CategoryLevelController::class);

Route::patch('categoryLavel/{id}', [CategoryLevelController::class, 'update']);
Route::delete('categoryLavel/{id}', [CategoryLevelController::class, 'destroy']); */
