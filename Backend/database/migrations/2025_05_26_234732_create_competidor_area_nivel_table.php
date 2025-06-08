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
        Schema::create('competidor_area_nivel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competitor_id')->constrained('competitor');
            $table->foreignId('area_id')->constrained('area');
            $table->foreignId('category_level_id')->constrained('category_level');
            $table->foreignId('registration_process_id')->constrained('registration_process');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('competidor_area_nivel');
    }
};
