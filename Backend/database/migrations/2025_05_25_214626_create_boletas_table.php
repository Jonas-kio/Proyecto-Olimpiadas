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
            $table->string('numero_boleta')->unique();
            $table->unsignedBigInteger('registration_process_id');
            $table->float('monto_total', 8, 2);
            $table->date('fecha_emision');
            $table->date('fecha_expiracion');
            $table->enum('estado', [
                'pendiente',
                'Pagado'
            ])->default('pendiente');
            $table->boolean('validado')->default(false);
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('boleta');
    }
};
