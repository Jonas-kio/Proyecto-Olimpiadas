<?php

namespace Tests\Feature\Controllers;

use App\Enums\EstadoInscripcion;
use App\Models\RegistrationProcess;
use App\Models\PaymentBill;
use App\Models\Competitor;
use App\Models\Tutor;
use App\Models\Olimpiada;
use App\Models\Area;
use App\Models\CategoryLevel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class InscripcionControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_can_start_registration_process()
    {
        // Crear datos de prueba
        $competitor = Competitor::factory()->create();
        $tutor = Tutor::factory()->create();
        $olimpiada = Olimpiada::factory()->create();
        $area = Area::factory()->create();
        $categoryLevel = CategoryLevel::factory()->create();

        // Datos para la solicitud
        $data = [
            'competitor_id' => $competitor->id,
            'tutor_id' => $tutor->id,
            'olimpiada_id' => $olimpiada->id,
            'area_id' => $area->id,
            'category_level_id' => $categoryLevel->id,
        ];

        // Hacer la solicitud
        $response = $this->postJson('/api/inscripcion/iniciar', $data);

        // Verificar la respuesta
        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'competitor_id',
                    'tutor_id',
                    'olimpiada_id',
                    'area_id',
                    'category_level_id',
                    'status',
                    'payment_bill' => [
                        'id',
                        'amount',
                        'status',
                        'payment_method',
                        'transaction_id',
                        'payment_details'
                    ]
                ]
            ]);

        // Verificar que se creó en la base de datos
        $this->assertDatabaseHas('registration_process', [
            'competitor_id' => $competitor->id,
            'tutor_id' => $tutor->id,
            'olimpiada_id' => $olimpiada->id,
            'area_id' => $area->id,
            'category_level_id' => $categoryLevel->id,
            'status' => EstadoInscripcion::PENDIENTE->value
        ]);
    }

    #[Test]
    public function it_cannot_start_registration_with_existing_active_registration()
    {
        // Crear una inscripción activa
        $competitor = Competitor::factory()->create();
        $olimpiada = Olimpiada::factory()->create();
        RegistrationProcess::factory()->create([
            'competitor_id' => $competitor->id,
            'olimpiada_id' => $olimpiada->id,
            'status' => EstadoInscripcion::PENDIENTE->value
        ]);

        // Crear datos para una nueva inscripción
        $tutor = Tutor::factory()->create();
        $area = Area::factory()->create();
        $categoryLevel = CategoryLevel::factory()->create();

        $data = [
            'competitor_id' => $competitor->id,
            'tutor_id' => $tutor->id,
            'olimpiada_id' => $olimpiada->id,
            'area_id' => $area->id,
            'category_level_id' => $categoryLevel->id,
        ];

        // Intentar crear una nueva inscripción
        $response = $this->postJson('/api/inscripcion/iniciar', $data);

        // Verificar que se rechaza
        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Ya existe una inscripción activa para este competidor en esta olimpiada'
            ]);
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
        $response = $this->putJson("/api/inscripcion/pago/{$paymentBill->id}", $paymentData);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'payment_method',
                    'transaction_id',
                    'payment_details',
                    'registration' => [
                        'id',
                        'status'
                    ]
                ]
            ]);

        // Verificar que se actualizó en la base de datos
        $this->assertDatabaseHas('payment_bill', [
            'id' => $paymentBill->id,
            'status' => 'paid',
            'payment_method' => 'Transferencia Bancaria',
            'transaction_id' => 'TRX123456'
        ]);

        $this->assertDatabaseHas('registration_process', [
            'id' => $registration->id,
            'status' => EstadoInscripcion::INSCRITO->value
        ]);
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
        $response = $this->getJson("/api/inscripcion/estado/{$registration->id}");

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'competitor' => [
                        'id',
                        'name'
                    ],
                    'tutor' => [
                        'id',
                        'name'
                    ],
                    'olimpiada' => [
                        'id',
                        'name'
                    ],
                    'area' => [
                        'id',
                        'name'
                    ],
                    'category_level' => [
                        'id',
                        'name'
                    ],
                    'payment_bill' => [
                        'id',
                        'status',
                        'amount'
                    ]
                ]
            ]);
    }

    #[Test]
    public function it_can_reject_registration()
    {
        // Crear una inscripción
        $registration = RegistrationProcess::factory()->create([
            'status' => EstadoInscripcion::PENDIENTE->value
        ]);

        $reason = 'Documentación incompleta';

        // Rechazar la inscripción
        $response = $this->putJson("/api/inscripcion/rechazar/{$registration->id}", [
            'rejection_reason' => $reason
        ]);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'rejection_reason'
                ]
            ]);

        // Verificar que se actualizó en la base de datos
        $this->assertDatabaseHas('registration_process', [
            'id' => $registration->id,
            'status' => EstadoInscripcion::RECHAZADO->value,
            'rejection_reason' => $reason
        ]);
    }
}
