<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cost;

class CostSeeder extends Seeder
{
    public function run()
    {
        Cost::create(['name' => 'Inscripción General', 'value' => 50, 'area' => 'Todas', 'category' => 'Todas']);
        Cost::create(['name' => 'Inscripción Temprana', 'value' => 40, 'area' => 'Todas', 'category' => 'Todas']);
        Cost::create(['name' => 'Inscripción Matemáticas Avanzado', 'value' => 60, 'area' => 'Matemáticas', 'category' => 'Universitaria']);
    }
}
