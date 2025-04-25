<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('boletas', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->date('fecha_emision');
            $table->decimal('monto_total', 8, 2);
            $table->string('correo_destino')->nullable();
            $table->string('estado')->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('boletas');
    }
};