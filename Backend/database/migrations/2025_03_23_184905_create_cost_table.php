<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('costs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('value', 8, 2);
            $table->string('area')->default('Todas');
            $table->string('category')->default('Todas');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('costs');
    }
};