<?php

namespace Database\Factories;

use App\Models\Olimpiada;
use App\Enums\OlimpiadaEstado;
use App\Enums\OlimpiadaModalidades;
use Illuminate\Database\Eloquent\Factories\Factory;

class OlimpiadaFactory extends Factory
{
    protected $model = Olimpiada::class;

    public function definition(): array
    {
        $fechaInicio = fake()->dateTimeBetween('now', '+1 month');
        $fechaFin = fake()->dateTimeBetween($fechaInicio, '+2 months');

        return [
            'nombre' => fake()->sentence(3),
            'descripcion' => fake()->paragraph(),
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'cupo_minimo' => fake()->numberBetween(10, 100),
            'modalidad' => OlimpiadaModalidades::PRESENCIAL,
            'estado' => OlimpiadaEstado::PENDIENTE,
            'activo' => true
        ];
    }
}
