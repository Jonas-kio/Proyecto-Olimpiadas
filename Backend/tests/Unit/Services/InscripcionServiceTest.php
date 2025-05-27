<?php

namespace Tests\Unit\Services;

use App\Models\RegistrationProcess;
use App\Models\Competitor;
use App\Models\Tutor;
use App\Models\Olimpiada;
use App\Models\Area;
use App\Models\CategoryLevel;
use App\Repositories\ProcesoInscripcionRepository;
use App\Services\InscripcionService;
use App\Enums\EstadoInscripcion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class InscripcionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $inscripcionService;
    protected $procesoRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->procesoRepository = $this->createMock(ProcesoInscripcionRepository::class);
        $this->inscripcionService = new InscripcionService($this->procesoRepository);
    }

    #[Test]
    public function it_can_start_registration_process()
    {
        $olimpiada = Olimpiada::factory()->create([
            'activo' => true,
            'fecha_fin' => now()->addDays(10)
        ]);

        $this->procesoRepository->expects($this->once())
            ->method('crear')
            ->willReturn(new RegistrationProcess());

        $proceso = $this->inscripcionService->iniciarProceso($olimpiada, 'individual', 1);

        $this->assertInstanceOf(RegistrationProcess::class, $proceso);
    }

    #[Test]
    public function it_cannot_start_registration_for_inactive_olimpiada()
    {
        $olimpiada = Olimpiada::factory()->create([
            'activo' => false
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('La olimpiada no está disponible para inscripciones');

        $this->inscripcionService->iniciarProceso($olimpiada, 'individual', 1);
    }

    #[Test]
    public function it_can_register_competitor()
    {
        $proceso = RegistrationProcess::factory()->create([
            'active' => true,
            'status' => EstadoInscripcion::PENDIENTE
        ]);

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

        $this->procesoRepository->expects($this->once())
            ->method('agregarCompetidor')
            ->willReturn(true);

        $competidor = $this->inscripcionService->registrarCompetidor($proceso, $datosCompetidor);

        $this->assertInstanceOf(Competitor::class, $competidor);
        $this->assertEquals('Juan', $competidor->nombres);
        $this->assertEquals('Pérez', $competidor->apellidos);
    }

    #[Test]
    public function it_can_register_tutor()
    {
        $proceso = RegistrationProcess::factory()->create([
            'active' => true,
            'status' => EstadoInscripcion::PENDIENTE
        ]);

        $competidor = Competitor::factory()->create();

        $datosTutor = [
            'nombres' => 'María',
            'apellidos' => 'García',
            'correo' => 'maria@mail.com',
            'telefono' => '12345678'
        ];

        $this->procesoRepository->expects($this->once())
            ->method('competidorPerteneceAProceso')
            ->willReturn(true);

        $tutor = $this->inscripcionService->registrarTutor(
            $proceso,
            $datosTutor,
            [$competidor->id],
            1
        );

        $this->assertInstanceOf(Tutor::class, $tutor);
        $this->assertEquals('María', $tutor->nombres);
    }

    #[Test]
    public function it_can_select_area()
    {
        $proceso = RegistrationProcess::factory()->create([
            'active' => true,
            'status' => EstadoInscripcion::PENDIENTE
        ]);

        $area = Area::factory()->create();
        $olimpiada = Olimpiada::factory()->create();
        $olimpiada->areas()->attach($area->id, ['activo' => true]);
        $proceso->olimpiada()->associate($olimpiada);

        $this->procesoRepository->expects($this->once())
            ->method('guardarSeleccionArea')
            ->willReturn(true);

        $result = $this->inscripcionService->guardarSeleccionArea($proceso, $area->id);

        $this->assertTrue($result);
    }

    #[Test]
    public function it_can_select_level_after_area()
    {
        $proceso = RegistrationProcess::factory()->create([
            'active' => true,
            'status' => EstadoInscripcion::PENDIENTE
        ]);

        $area = Area::factory()->create();
        $nivel = CategoryLevel::factory()->create([
            'area_id' => $area->id,
            'activo' => true
        ]);

        $this->procesoRepository->method('obtenerAreaSeleccionada')
            ->willReturn($area->id);

        $this->procesoRepository->expects($this->once())
            ->method('guardarSeleccionNivel')
            ->willReturn(true);

        $result = $this->inscripcionService->guardarSeleccionNivel($proceso, $nivel->id);

        $this->assertTrue($result);
    }

    #[Test]
    public function it_generates_registration_summary()
    {
        $proceso = RegistrationProcess::factory()
            ->has(Competitor::factory())
            ->has(Olimpiada::factory())
            ->create([
                'type' => 'individual',
                'status' => EstadoInscripcion::PENDIENTE
            ]);

        $area = Area::factory()->create();
        $nivel = CategoryLevel::factory()->create();

        $this->procesoRepository->method('obtenerCompetidores')
            ->willReturn(collect([$proceso->competitor]));

        $this->procesoRepository->method('obtenerAreaSeleccionada')
            ->willReturn($area->id);

        $this->procesoRepository->method('obtenerNivelSeleccionado')
            ->willReturn($nivel->id);

        $resumen = $this->inscripcionService->generarResumen($proceso);

        $this->assertArrayHasKey('proceso_id', $resumen);
        $this->assertArrayHasKey('olimpiada', $resumen);
        $this->assertArrayHasKey('competidores', $resumen);
        $this->assertArrayHasKey('seleccion', $resumen);
    }
}
