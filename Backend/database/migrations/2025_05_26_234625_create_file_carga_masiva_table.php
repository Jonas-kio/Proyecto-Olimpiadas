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
        Schema::create('file_carga_masiva', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_process_id')->constrained('registration_process');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('status')->default('pending'); // pending, processed, error
            $table->text('error_details')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_carga_masiva');
    }
};
