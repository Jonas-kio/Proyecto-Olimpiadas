<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use thiagoalessio\TesseractOCR\TesseractOCR;

class OcrServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(TesseractOCR::class, function ($app) {
            return new TesseractOCR();
        });
    }

    public function boot()
    {
        //
    }
}