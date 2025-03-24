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
        Schema::create('category_level', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('area')->cascadeOnDelete();
            $table->foreignId('grade_id')->constrained('grade')->cascadeOnDelete();
            $table->string('code', 16)->unique();
            $table->string('name', 20);
            $table->string('description', 150);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_level');
    }
};
