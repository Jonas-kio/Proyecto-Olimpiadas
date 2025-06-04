<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\AuthService;

class AdminSeeder extends Seeder
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function run()
        {
        $this->command->info('Creando administrador predeterminado...');

        $result = $this->authService->createAdmin([
            'full_name' => 'Administrador Principal',
            'email' => 'admin@olimpiadas.com',
            'password' => 'AdminOlimpiadas123!'
        ]);

        if ($result['success']) {
            $this->command->info('Administrador creado exitosamente: ' . $result['user']->email);
        } else {
            if (isset($result['adminExists']) && $result['adminExists']) {
                $this->command->info('Ya existe al menos un administrador en el sistema. No se creará otro.');
            } else if (isset($result['user'])) {
                $this->command->info('Ya existe un usuario con el email ' . $result['user']->email);
            } else {
                $this->command->warn('No se pudo crear el administrador: ' . $result['message']);
            }
        }
    }
}
