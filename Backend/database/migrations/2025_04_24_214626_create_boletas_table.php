<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boleta', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->date('fecha_emision');
            $table->decimal('monto_total', 10, 2);
            $table->string('correo_destino');
            $table->string('nombre_competidor');
            $table->enum('estado', ['enviado', 'pendiente', 'cancelado'])->default('pendiente');
            $table->foreignId('registration_process_id')->constrained('registration_process')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boleta');
    }
};