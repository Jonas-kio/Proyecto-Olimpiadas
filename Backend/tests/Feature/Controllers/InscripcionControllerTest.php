<?php

namespace Tests\Feature\Controllers;

use App\Enums\EstadoInscripcion;
use App\Models\Area;
use App\Models\CategoryLevel;
use App\Models\Competitor;
use App\Models\Olimpiada;
use App\Models\RegistrationProcess;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class InscripcionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    #[Test]
    public function test_complete_registration_flow()
    {
        $olimpiada = Olimpiada::factory()->create([
            'activo' => true,
            'fecha_fin' => now()->addDays(10)
        ]);

        $response = $this->postJson("/api/inscripcion/olimpiada/{$olimpiada->id}/iniciar", [
            'tipo' => 'individual'
        ]);

        $response->assertStatus(200);
        $procesoId = $response->json('proceso_id');

        $datosCompetidor = [
            'nombres' => 'Juan',
            'apellidos' => 'Pérez',
            'documento_identidad' => '12345678',
            'provincia' => 'La Paz',
            'fecha_nacimiento' => '2000-01-01',
            'curso' => '4to Secundaria',
            'correo_electronico' => 'juan@mail.com',
            'colegio' => 'San Calixto'
        ];

        $response = $this->postJson("/api/inscripcion/proceso/{$procesoId}/competidor", $datosCompetidor);
        $response->assertStatus(200);
        $competidorId = $response->json('competidor_id');

        $datosTutor = [
            'nombres' => 'María',
            'apellidos' => 'García',
            'correo_electronico' => 'maria@mail.com',
            'telefono' => '12345678',
            'competidores_ids' => [$competidorId]
        ];

        $response = $this->postJson("/api/inscripcion/proceso/{$procesoId}/tutor", $datosTutor);
        $response->assertStatus(200);

        $area = Area::factory()->create();
        $olimpiada->areas()->attach($area->id, ['activo' => true]);

        $response = $this->postJson("/api/inscripcion/proceso/{$procesoId}/area", [
            'area_id' => $area->id
        ]);
        $response->assertStatus(200);

        $nivel = CategoryLevel::factory()->create([
            'area_id' => $area->id
        ]);

        $response = $this->postJson("/api/inscripcion/proceso/{$procesoId}/nivel", [
            'nivel_id' => $nivel->id
        ]);
        $response->assertStatus(200);

        $response = $this->getJson("/api/inscripcion/proceso/{$procesoId}/resumen");
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'resumen' => [
                    'proceso_id',
                    'olimpiada',
                    'competidores',
                    'seleccion'
                ]
            ]);

        $response = $this->postJson("/api/inscripcion/proceso/{$procesoId}/boleta");
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'boleta_id',
                'numero_boleta'
            ]);
    }

    #[Test]
    public function test_invalid_area_selection()
    {
        $olimpiada = Olimpiada::factory()->create(['activo' => true]);
        $proceso = RegistrationProcess::factory()->create([
            'olimpiada_id' => $olimpiada->id,
            'active' => true,
            'status' => EstadoInscripcion::PENDIENTE
        ]);

        $area = Area::factory()->create();

        $response = $this->postJson("/api/inscripcion/proceso/{$proceso->id}/area", [
            'area_id' => $area->id
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_invalid_level_selection()
    {
        $olimpiada = Olimpiada::factory()->create(['activo' => true]);
        $proceso = RegistrationProcess::factory()->create([
            'olimpiada_id' => $olimpiada->id,
            'active' => true,
            'status' => EstadoInscripcion::PENDIENTE
        ]);

        $area = Area::factory()->create();
        $nivel = CategoryLevel::factory()->create();

        $response = $this->postJson("/api/inscripcion/proceso/{$proceso->id}/nivel", [
            'nivel_id' => $nivel->id
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_cannot_generate_boleta_without_complete_data()
    {
        $proceso = RegistrationProcess::factory()->create([
            'active' => true,
            'status' => EstadoInscripcion::PENDIENTE
        ]);

        $response = $this->postJson("/api/inscripcion/proceso/{$proceso->id}/boleta");
        $response->assertStatus(422);
    }
}
