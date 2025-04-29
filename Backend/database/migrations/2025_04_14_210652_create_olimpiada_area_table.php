<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('olimpiada_area', function (Blueprint $table) {
            $table->id();
            $table->foreignId('olimpiada_id')->constrained('olimpiadas')->onDelete('cascade');
            $table->foreignId('area_id')->constrained('area')->onDelete('cascade');
            $table->boolean('activo')->default(true);
            $table->unique(['olimpiada_id', 'area_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('olimpiada_area');
    }
};
