<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\CostController;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryLevelController;
use App\Http\Controllers\API\Inscripcion\InscripcionController;
use App\Http\Controllers\API\Olimpiada\OlimpiadaController;
use App\Http\Controllers\CompetitorController;
use App\Http\Controllers\TutorController;
use App\Http\Controllers\BoletaPagoController;
use App\Http\Controllers\OcrController;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsUserAuth;
use App\Http\Middleware\VerificarProcesoInscripcion;

//TODO: Rutas Publicas



//Ruta del competidor
Route::post('/inscripcion/competidor', [CompetitorController::class, 'store']);

//Ruta del tutor
Route::post('/inscripcion/tutor', [TutorController::class, 'store']);

//Ruta de area
Route::get('/inscripcion/area', [AreaController::class, 'index']);
//Ruta para obetener niveles inscripcion
Route::get('/categoryLevelUser', [CategoryLevelController::class, 'index']);
Route::get('/categoryLevelUser', [CategoryLevelController::class, 'index']); //Prueba


// Rutas públicas de olimpiadas (visibles sin autenticación)
Route::get('/libre/olimpiadas/', [OlimpiadaController::class, 'index'])->name('olimpiadas.index');

Route::get('crear-admin', [AuthController::class, 'crearAdmin']);
Route::get('/libre/olimpiadas/{olimpiada}', [OlimpiadaController::class, 'show']);





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
        Route::prefix('user')->group(function () {

            Route::post('/olimpiadas/{olimpiada}/inscribir', [OlimpiadaController::class, 'inscribir']);
            Route::get('/olimpiadas/inscripciones', [OlimpiadaController::class, 'misInscripciones']);
            Route::post('/olimpiadas/inscripciones/{inscripcion}/comprobante', [OlimpiadaController::class, 'subirComprobante']);

            // Rutas para obtener información de olimpiadas
            Route::get('/olimpiadas', [OlimpiadaController::class, 'index'])->name('olimpiadas.index');
            Route::get('/olimpiadas/{olimpiada}', [OlimpiadaController::class, 'show']);

            Route::get('/categoryLevel/{category_id}/{area_id}', [CategoryLevelController::class, 'getCategoryByIdAndAreaId']);

            Route::post('/inscripcion/competidor', [CompetitorController::class, 'store']);

            
        });
        // FLUJO DE INSCRIPCIÓN COMPLETO
        Route::prefix('inscripcion')->name('inscripcion.')->group(function () {
                // Iniciar proceso
                Route::post('/olimpiada/{olimpiada}/iniciar', [InscripcionController::class, 'iniciarProceso'])
                    ->name('iniciar');

                // Rutas que requieren un proceso de inscripción activo
                Route::middleware([VerificarProcesoInscripcion::class])->group(function () {
                    // Competidores
                    Route::post('/proceso/{proceso}/competidor', [InscripcionController::class, 'registrarCompetidor'])
                        ->name('competidor.registrar');

                    // Tutores
                    Route::post('/proceso/{proceso}/tutor', [InscripcionController::class, 'registrarTutor'])
                        ->name('tutor.registrar');

                    // Selección de área
                    Route::post('/proceso/{proceso}/area', [InscripcionController::class, 'seleccionarArea'])
                        ->name('area.seleccionar');

                    // Selección de nivel
                    Route::post('/proceso/{proceso}/nivel', [InscripcionController::class, 'seleccionarNivel'])
                        ->name('nivel.seleccionar');

                    // Obtener resumen de inscripción
                    Route::get('/proceso/{proceso}/resumen', [InscripcionController::class, 'obtenerResumen'])
                        ->name('resumen');

                    // Generar boleta
                    Route::post('/proceso/{proceso}/boleta', [InscripcionController::class, 'generarBoleta'])
                        ->name('boleta.generar');
                });

                // Obtener detalles de boleta (no requiere verificar proceso)
                Route::get('/boleta/{boleta}', [InscripcionController::class, 'obtenerBoleta'])
                    ->name('boleta.ver');
            });
             //TODO: Rutas para Servicios Auxiliares (OCR)
        Route::prefix('ocr')->group(function () {
        Route::post('/procesar-imagen', [OcrController::class, 'procesarImagenOCR']);
        Route::post('/extraer-numero', [OcrController::class, 'extraerNumeroDesdeTexto']);
    });

    }
);

// Ruta de boleta
Route::get('/boleta/{registro}', [BoletaPagoController::class, 'generarPDF']);
Route::post('/boleta/enviar', [BoletaPagoController::class, 'enviarPorCorreo']);

Route::post('/boleta/pdf', [BoletaPagoController::class, 'generarBoletaPDF']);
Route::post('/boleta/email', [BoletaPagoController::class, 'enviarBoletaPorCorreo']);
Route::post('/boleta/ocr', [BoletaPagoController::class, 'extraerNumeroDesdeOCR']);
Route::post('/boleta/ocr-imagen', [BoletaPagoController::class, 'procesarImagenOCR']);
