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
        Schema::create('competidor_tutor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competidor_id')->constrained('competitor')->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained('tutor')->onDelete('cascade');
            $table->boolean('es_principal')->default(false);
            $table->string('relacion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Evitar duplicados
            $table->unique(['competidor_id', 'tutor_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('competidor_tutor');
    }
};
