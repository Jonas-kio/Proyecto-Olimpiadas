<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('proof_of_payment', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('registration_process_id');
            $table->unsignedBigInteger('boleta_id')->nullable();
            $table->string('ruta_imagen');
            $table->text('texto_detectado')->nullable();
            $table->string('numero_boleta_detectado')->nullable();
            $table->string('nombre_pagador_detectado')->nullable();
            $table->decimal('monto_detectado', 10, 2)->nullable();
            $table->boolean('validacion_exitosa')->default(false);
            $table->boolean('es_pago_grupal')->default(false);
            $table->integer('cantidad_participantes')->nullable();
            $table->integer('intento_numero');
            $table->json('metadata_ocr')->nullable();
            $table->timestamps();

            $table->foreign('registration_process_id')
                  ->references('id')
                  ->on('registration_process')
                  ->onDelete('cascade');

            $table->foreign('boleta_id')
                  ->references('id')
                  ->on('boleta')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proof_of_payment');
    }
};
