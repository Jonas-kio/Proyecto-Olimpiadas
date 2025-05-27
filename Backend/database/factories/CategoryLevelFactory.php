<?php

namespace Database\Factories;

use App\Models\CategoryLevel;
use App\Models\Area;
use App\Enums\GradeName;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryLevelFactory extends Factory
{
    protected $model = CategoryLevel::class;

    public function definition(): array
    {
        return [
            'area_id' => Area::factory(),
            'name' => fake()->word(),
            'description' => fake()->sentence(),
            'grade_name' => GradeName::PRIMARY->value,
            'grade_min' => fake()->numberBetween(1, 3),
            'grade_max' => fake()->numberBetween(4, 6),
        ];
    }
}
