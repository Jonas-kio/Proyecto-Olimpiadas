<?php

use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\SwaggerController;

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/api-docs', [SwaggerController::class, 'generateDocs']);
