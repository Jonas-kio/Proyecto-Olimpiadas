<?php

namespace Database\Factories;

use App\Models\Competitor;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompetitorFactory extends Factory
{
    protected $model = Competitor::class;

    public function definition(): array
    {
        return [
            'nombres' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'documento_identidad' => fake()->unique()->numerify('########'),
            'provincia' => fake()->city(),
            'fecha_nacimiento' => fake()->date(),
            'curso' => fake()->randomElement(['1ro Secundaria', '2do Secundaria', '3ro Secundaria', '4to Secundaria', '5to Secundaria', '6to Secundaria']),
            'correo_electronico' => fake()->unique()->safeEmail(),
            'colegio' => fake()->company() . ' School'
        ];
    }
}
