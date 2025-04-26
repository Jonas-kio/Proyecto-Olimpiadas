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
        Schema::create('boleta', function (Blueprint $table) {
            $table->id();
            $table->string('numero_boleta')->unique();
            $table->unsignedBigInteger('registration_detail_id');
            $table->timestamps();

            $table->foreign('registration_detail_id')
                  ->references('id')
                  ->on('registration_detail')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boleta');
    }
};