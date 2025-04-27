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
            $table->string('estado', [
                'pendiente',
                'pagado'
            ])->default('pendiente');
            $table->timestamps();

            $table->foreign('registration_process_id')
                ->references('id')
                ->on('registration_process')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boleta');
    }
};
