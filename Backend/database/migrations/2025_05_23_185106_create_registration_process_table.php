<?php

use App\Enums\EstadoInscripcion;
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
        Schema::create('registration_process', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competitor_id')->constrained('competitor')->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained('tutor')->onDelete('cascade');
            $table->foreignId('olimpiada_id')->constrained('olimpiadas')->onDelete('cascade');
            $table->foreignId('area_id')->constrained('area')->onDelete('cascade');
            $table->foreignId('category_level_id')->constrained('category_level')->onDelete('cascade');
            $table->foreignId('payment_bill_id')->nullable()->constrained('payment_bill')->onDelete('cascade');
            $table->enum('status', [
                'Pendiente',
                'Inscrito',
                'Rechazado',
            ])->default('Pendiente');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('registration_process');
    }
};
