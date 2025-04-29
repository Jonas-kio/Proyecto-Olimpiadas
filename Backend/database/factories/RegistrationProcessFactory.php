<?php

namespace Database\Factories;

use App\Models\RegistrationProcess;
use App\Models\User;
use App\Models\Olimpiada;
use App\Enums\EstadoInscripcion;
use Illuminate\Database\Eloquent\Factories\Factory;

class RegistrationProcessFactory extends Factory
{
    protected $model = RegistrationProcess::class;

    public function definition(): array
    {
        return [
            'olimpiada_id' => Olimpiada::factory(),
            'usuario_id' => User::factory(),
            'status' => EstadoInscripcion::PENDIENTE,
            'start_date' => now(),
            'type' => 'individual',
            'active' => true
        ];
    }

    public function individual()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'individual'
            ];
        });
    }

    public function grupal()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'grupal'
            ];
        });
    }
}
