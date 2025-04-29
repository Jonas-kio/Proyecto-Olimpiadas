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
        Schema::create('registration_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('register_process_id')->constrained('registration_process')->onDelete('cascade');
            $table->foreignId('competidor_id')->constrained('competitor')->onDelete('cascade');
            $table->foreignId('area_id')->constrained('area')->onDelete('cascade');
            $table->foreignId('categoria_id')->constrained('category_level')->onDelete('cascade');
            $table->float('monto');
            $table->boolean('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_detail');
    }
};
