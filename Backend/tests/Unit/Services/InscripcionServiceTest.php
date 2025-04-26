<?php

namespace Tests\Unit\Services;

use App\Enums\EstadoInscripcion;
use App\Models\RegistrationProcess;
use App\Models\PaymentBill;
use App\Models\Competitor;
use App\Models\Tutor;
use App\Models\Olimpiada;
use App\Models\Area;
use App\Models\CategoryLevel;
use App\Services\InscripcionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class InscripcionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $inscripcionService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->inscripcionService = new InscripcionService();
    }

    #[Test]
    public function it_can_create_a_registration_process()
    {
        // Crear datos de prueba
        $competitor = Competitor::factory()->create();
        $tutor = Tutor::factory()->create();
        $olimpiada = Olimpiada::factory()->create();
        $area = Area::factory()->create();
        $categoryLevel = CategoryLevel::factory()->create();

        // Datos para la inscripción
        $data = [
            'competitor_id' => $competitor->id,
            'tutor_id' => $tutor->id,
            'olimpiada_id' => $olimpiada->id,
            'area_id' => $area->id,
            'category_level_id' => $categoryLevel->id,
        ];

        // Crear el proceso de inscripción
        $registration = $this->inscripcionService->crearProcesoInscripcion($data);

        // Verificar que se creó correctamente
        $this->assertInstanceOf(RegistrationProcess::class, $registration);
        $this->assertEquals($competitor->id, $registration->competitor_id);
        $this->assertEquals($tutor->id, $registration->tutor_id);
        $this->assertEquals($olimpiada->id, $registration->olimpiada_id);
        $this->assertEquals($area->id, $registration->area_id);
        $this->assertEquals($categoryLevel->id, $registration->category_level_id);
        $this->assertEquals(EstadoInscripcion::PENDIENTE->value, $registration->status);

        // Verificar que se creó la boleta de pago
        $this->assertNotNull($registration->paymentBill);
        $this->assertEquals('pending', $registration->paymentBill->status);
    }

    #[Test]
    public function it_can_update_payment_status()
    {
        // Crear una inscripción con boleta de pago
        $registration = RegistrationProcess::factory()->create();
        $paymentBill = PaymentBill::factory()->create([
            'status' => 'pending'
        ]);
        $registration->update(['payment_bill_id' => $paymentBill->id]);

        // Datos del pago
        $paymentData = [
            'payment_method' => 'Transferencia Bancaria',
            'transaction_id' => 'TRX123456',
            'payment_details' => 'Pago realizado el 15/04/2024'
        ];

        // Actualizar el estado del pago
        $result = $this->inscripcionService->actualizarEstadoPago($paymentBill->id, $paymentData);

        // Verificar que se actualizó correctamente
        $this->assertEquals('paid', $result['payment']->status);
        $this->assertEquals(EstadoInscripcion::INSCRITO->value, $result['registration']->status);
        $this->assertEquals('Transferencia Bancaria', $result['payment']->payment_method);
        $this->assertEquals('TRX123456', $result['payment']->transaction_id);
    }

    #[Test]
    public function it_can_reject_a_registration()
    {
        // Crear una inscripción
        $registration = RegistrationProcess::factory()->create([
            'status' => EstadoInscripcion::PENDIENTE->value
        ]);

        $reason = 'Documentación incompleta';

        // Rechazar la inscripción
        $updatedRegistration = $this->inscripcionService->rechazarInscripcion($registration->id, $reason);

        // Verificar que se actualizó correctamente
        $this->assertEquals(EstadoInscripcion::RECHAZADO->value, $updatedRegistration->status);
        $this->assertEquals($reason, $updatedRegistration->rejection_reason);
    }

    #[Test]
    public function it_can_check_for_existing_registration()
    {
        // Crear una inscripción activa
        $competitor = Competitor::factory()->create();
        $olimpiada = Olimpiada::factory()->create();
        $registration = RegistrationProcess::factory()->create([
            'competitor_id' => $competitor->id,
            'olimpiada_id' => $olimpiada->id,
            'status' => EstadoInscripcion::PENDIENTE->value
        ]);

        // Verificar que existe una inscripción activa
        $existingRegistration = $this->inscripcionService->verificarInscripcionExistente(
            $competitor->id,
            $olimpiada->id
        );

        $this->assertNotNull($existingRegistration);
        $this->assertEquals($registration->id, $existingRegistration->id);
    }

    #[Test]
    public function it_can_get_registration_status()
    {
        // Crear una inscripción con relaciones
        $registration = RegistrationProcess::factory()
            ->has(Competitor::factory())
            ->has(Tutor::factory())
            ->has(Olimpiada::factory())
            ->has(Area::factory())
            ->has(CategoryLevel::factory())
            ->has(PaymentBill::factory())
            ->create();

        // Obtener el estado de la inscripción
        $result = $this->inscripcionService->obtenerEstadoInscripcion($registration->id);

        // Verificar que se obtuvieron todas las relaciones
        $this->assertNotNull($result->competitor);
        $this->assertNotNull($result->tutor);
        $this->assertNotNull($result->olimpiada);
        $this->assertNotNull($result->area);
        $this->assertNotNull($result->categoryLevel);
        $this->assertNotNull($result->paymentBill);
    }
}
