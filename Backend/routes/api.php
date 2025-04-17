<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\CostController;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryLevelController;
use App\Http\Controllers\API\Olimpiada\OlimpiadaController;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsUserAuth;

use App\Http\Controllers\CompetitorController;

use App\Http\Controllers\TutorController;
use App\Http\Controllers\CostController as ControllersCostController;




//Ruta del competidor
Route::post('/inscripcion/competidor', [CompetitorController::class, 'store']);

//Ruta del tutor
Route::post('/inscripcion/tutor', [TutorController::class, 'store']);

//Ruta de area
Route::get('/inscripcion/area', [AreaController::class, 'index']);


// Rutas públicas de olimpiadas (visibles sin autenticación)
Route::get('/Olimpiadas', [OlimpiadaController::class, 'index'])->name('olimpiadas.index');
Route::get('/olimpiadas/{olimpiada}', [OlimpiadaController::class, 'show']);




//TODO: Rutas Publicas
Route::post('register', [AuthController::class, 'register']);
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
                Route::apiResource('categoryLevel', CategoryLevelController::class);
                Route::patch('categoryLevel/{id}', [CategoryLevelController::class, 'update']);
                Route::delete('categoryLevel/{id}', [CategoryLevelController::class, 'destroy']);

                // Rutas para configuración de costos
                Route::controller(CostController::class)->group(function () {
                    Route::get('/costs', 'index');
                    Route::post('/costs', 'store');
                    Route::put('/costs/{cost}', 'update');
                    Route::delete('/costs/{cost}', 'destroy');
                });

                // Rutas de administración de olimpiadas
                Route::prefix('olimpiadas')->group(function () {
                    Route::get('/', [OlimpiadaController::class, 'index'])->name('olimpiadas.index');
                    Route::post('/', [OlimpiadaController::class, 'store'])->name('olimpiadas.store');
                    Route::get('/{olimpiada}', [OlimpiadaController::class, 'show'])->name('olimpiadas.show');
                    Route::put('/{olimpiada}', [OlimpiadaController::class, 'update'])->name('olimpiadas.update');
                    Route::delete('/{olimpiada}', [OlimpiadaController::class, 'destroy'])->name('olimpiadas.destroy');
                    Route::patch('/{olimpiada}/status', [OlimpiadaController::class, 'changeStatus']);

                    // Manejo de áreas en olimpiadas
                    Route::get('/{olimpiada}/areas', [OlimpiadaController::class, 'getAreas']);
                    Route::post('/{olimpiada}/areas', [OlimpiadaController::class, 'attachAreas']);
                    Route::delete('/{olimpiada}/areas/{area}', [OlimpiadaController::class, 'detachArea']);
                });


                // Mas Rutas de Admin ........
            }
        );

        //TODO: Rutas Para Usuario que no es administrador
        //....... AQUI!!!
        Route::prefix('user')->group(function () {
            Route::post('/olimpiadas/{olimpiada}/inscribir', [OlimpiadaController::class, 'inscribir']);
            Route::get('/olimpiadas/inscripciones', [OlimpiadaController::class, 'misInscripciones']);
            Route::post('/olimpiadas/inscripciones/{inscripcion}/comprobante', [OlimpiadaController::class, 'subirComprobante']);
        });

        //Ruta del competidor
        Route::post('/inscripcion/competidor', [CompetitorController::class, 'store']);
    }
);
