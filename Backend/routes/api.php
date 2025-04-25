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
use App\Http\Controllers\BoletaPagoController;
use App\Http\Controllers\API\OCR\OcrController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\InscripcionController;




//Ruta del competidor
Route::post('/inscripcion/competidor', [CompetitorController::class, 'store']);

//Ruta del tutor
Route::post('/inscripcion/tutor', [TutorController::class, 'store']);

//Ruta de area
Route::get('/inscripcion/area', [AreaController::class, 'index']);


//Ruta para obetener niveles inscripcion
Route::get('/categoryLevelUser', [CategoryLevelController::class, 'index']); //Prueba


// Rutas públicas de olimpiadas (visibles sin autenticación)
Route::get('/Olimpiadas', [OlimpiadaController::class, 'index'])->name('olimpiadas.index');
Route::get('/olimpiadas/{olimpiada}', [OlimpiadaController::class, 'show']);





//TODO: Rutas Publicas

Route::get('crear-admin', [AuthController::class, 'crearAdmin']);
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
        //....... AQUI!!!
        Route::prefix('user')->group(function () {
            Route::post('/olimpiadas/{olimpiada}/inscribir', [OlimpiadaController::class, 'inscribir']);
            Route::get('/olimpiadas/inscripciones', [OlimpiadaController::class, 'misInscripciones']);
            Route::post('/olimpiadas/inscripciones/{inscripcion}/comprobante', [OlimpiadaController::class, 'subirComprobante']);
        });

        Route::get('/Olimpiadas', [OlimpiadaController::class, 'index'])->name('olimpiadas.index');
        Route::get('/olimpiadas/{olimpiada}', [OlimpiadaController::class, 'show']);

        //Ruta del competidor
        Route::post('/inscripcion/competidor', [CompetitorController::class, 'store']);
    }
);

// Ruta de boleta
Route::get('/boleta/{registro}', [BoletaPagoController::class, 'generarPDF']);
Route::post('/boleta/enviar', [BoletaPagoController::class, 'enviarPorCorreo']);

// Ruta ocrcontroller
Route::post('/validar-comprobante', [OcrController::class, 'validarComprobante']);

Route::prefix('registration')->group(function () {
    Route::post('/competitor', [RegistrationController::class, 'registerCompetitor']);
    Route::post('/tutor', [RegistrationController::class, 'registerTutor']);
    Route::post('/complete', [RegistrationController::class, 'completeRegistration']);
    Route::post('/payment/{paymentBillId}', [RegistrationController::class, 'updatePayment']);
    Route::get('/status/{registrationId}', [RegistrationController::class, 'getRegistrationStatus']);
});

// Rutas de inscripción
Route::prefix('inscripcion')->group(function () {
    // Rutas existentes
    Route::post('/competidor', [CompetitorController::class, 'store']);
    Route::post('/tutor', [TutorController::class, 'store']);
    Route::get('/area', [AreaController::class, 'index']);
    Route::get('/categoryLevelUser', [CategoryLevelController::class, 'index']);

    // Nuevas rutas para el proceso de inscripción
    Route::post('/iniciar', [InscripcionController::class, 'iniciarProceso']);
    Route::post('/pago/{paymentBillId}', [InscripcionController::class, 'actualizarEstadoPago']);
    Route::get('/estado/{registrationId}', [InscripcionController::class, 'consultarEstado']);
});

Route::post('/boleta/pdf', [BoletaPagoController::class, 'generarBoletaPDF']);
Route::post('/boleta/email', [BoletaPagoController::class, 'enviarBoletaPorCorreo']);
Route::post('/boleta/ocr', [BoletaPagoController::class, 'extraerNumeroDesdeOCR']);
Route::post('/boleta/ocr-imagen', [BoletaPagoController::class, 'procesarImagenOCR']);
Route::post('/ocr/comprobante', [OcrController::class, 'extraerYValidarComprobante']);
