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
use App\Http\Controllers\API\OCR\OcrController;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsUserAuth;
use App\Http\Middleware\VerificarProcesoInscripcion;

//TODO: Rutas Publicas



//Ruta para obetener niveles inscripcion
Route::get('/categoryLevelUser', [CategoryLevelController::class, 'indexUser']); //Prueba


// Rutas públicas de olimpiadas (visibles sin autenticación)

Route::get('crear-admin', [AuthController::class, 'crearAdmin']);
Route::get('/libre/olimpiadas/', [OlimpiadaController::class, 'index'])->name('olimpiadas.index');
Route::get('/libre/olimpiadas/{olimpiada}', [OlimpiadaController::class, 'show']);





//TODO: Rutas Publicas
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::post('email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.resend');

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
                    Route::match(['put', 'patch'], '/{olimpiada}', [OlimpiadaController::class, 'update'])->name('olimpiadas.update');
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
            Route::get('/olimpiadas', [OlimpiadaController::class, 'indexUser'])->name('olimpiadas.indexUser');
            Route::get('/olimpiadas/{olimpiada}', [OlimpiadaController::class, 'show']);
            Route::get('/olimpiadas/{olimpiada}/areas', [OlimpiadaController::class, 'getAreasByOlimpiada'])->name('olimpiadas.areas');

            // Rutas para obtener información de areas por el ususario
            Route::get('/areas', [AreaController::class, 'index'])->name('areas.indexUser');
            Route::get('/areas/{area}', [AreaController::class, 'show'])->name('areas.showUser');

            // Rutas para obtener información de las categorias
            Route::get('/categoryLevel', [CategoryLevelController::class, 'indexUser'])->name('categoryLevel.indexUser');
            Route::get('/categoryLevel/area/{area_id}', [CategoryLevelController::class, 'getCategoryByAreaId'])->name('categoryLevel.area');
            Route::get('/categoryLevel/{category_id}/{area_id}', [CategoryLevelController::class, 'getCategoryByIdAndAreaId']);

            Route::post('/inscripcion/competidor', [CompetitorController::class, 'store']);

        });

        // FLUJO DE VALIDACION DE COMPROVANTE CON OCR
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
                    Route::post('/proceso/{proceso}/nivel/', [InscripcionController::class, 'seleccionarNivel'])
                        ->name('nivel.seleccionar');

                // Obtener resumen de inscripción
                Route::get('/proceso/{proceso}/resumen', [InscripcionController::class, 'obtenerResumen'])
                    ->name('resumen');

                // Verificar estado del proceso
                Route::get('/proceso/{proceso}/estado', [InscripcionController::class, 'verificarEstadoProceso'])
                    ->name('proceso.estado');

                // Diagnosticar problemas con el proceso
                Route::get('/proceso/{proceso}/diagnostico', [InscripcionController::class, 'diagnosticarProceso'])
                    ->name('proceso.diagnostico');

                // Generar boleta
                Route::post('/proceso/{proceso}/boleta', [InscripcionController::class, 'generarBoleta'])
                    ->name('boleta.generar');
            });

            // Obtener detalles de boleta (no requiere verificar proceso)
            Route::get('/boleta/{boleta}', [InscripcionController::class, 'obtenerBoleta'])
                ->name('boleta.ver');
        });

        Route::prefix('ocr')->name('ocr.')->group(function () {

            Route::put('/proceso/{proceso}/estado', [InscripcionController::class, 'actualizarEstadoProceso'])
                    ->name('proceso.actualizar.estado');
        });

    }
);

// Ruta de boleta
Route::get('/boleta/{registro}', [BoletaPagoController::class, 'generarPDF']);
Route::post('/boleta/enviar', [BoletaPagoController::class, 'enviarBoletaPorCorreo']);

Route::post('/boleta/pdf', [BoletaPagoController::class, 'generarBoletaPDF']);
Route::post('/boleta/email', [BoletaPagoController::class, 'enviarBoletaPorCorreo']);
Route::post('/boleta/ocr', [BoletaPagoController::class, 'extraerNumeroDesdeOCR']);
Route::post('/boleta/ocr-imagen', [BoletaPagoController::class, 'procesarImagenOCR']);
Route::post('/ocr/comprobante', [OcrController::class, 'extraerYValidarComprobante']);


// Ruta ocrcontroller
Route::post('/validar-comprobante', [OcrController::class, 'validarComprobante']);
