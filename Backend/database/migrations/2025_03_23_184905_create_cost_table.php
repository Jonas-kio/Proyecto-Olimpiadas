<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('costs', function (Blueprint $table) {
            $table->id();
            $table->string('name', 30);
            $table->decimal('price', 8, 2);
            $table->foreignId('area_id')->constrained('area')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('category_level')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('costs');
    }
};
