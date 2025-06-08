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
        Schema::create('olimpiadas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->integer('cupo_minimo')->default(0);
            $table->enum('modalidad', [
                'Presencial',
                'Virtual',
                'Híbrida'
            ]);
            $table->string('ruta_pdf_detalles')->nullable();
            $table->string('ruta_imagen_portada')->nullable();
            $table -> enum('estado', [
                'Pendiente',
                'En Proceso',
                'Terminado'
            ]);
            $table->boolean('activo')->default(true);
            $table->integer('maximo_areas')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('olimpiadas');
    }
};
