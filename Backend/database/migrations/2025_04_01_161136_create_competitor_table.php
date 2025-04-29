<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up()
    {
        Schema::create('competitor', function (Blueprint $table) {
            $table->id();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('documento_identidad');
            $table->string('provincia');
            $table->date('fecha_nacimiento');
            $table->string('curso');
            $table->string('correo_electronico')->unique();
            $table->string('colegio');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitor');
    }
};
