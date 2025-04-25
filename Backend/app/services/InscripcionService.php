<?php

namespace App\Services;

use App\Models\RegistrationProcess;
use App\Models\PaymentBill;
use App\Models\Competitor;
use App\Models\Tutor;
use App\Models\Olimpiada;
use App\Models\Area;
use App\Models\CategoryLevel;
use App\Enums\EstadoInscripcion;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InscripcionService
{
    public function verificarInscripcionExistente($competitorId, $olimpiadaId)
    {
        return RegistrationProcess::where('competitor_id', $competitorId)
            ->where('olimpiada_id', $olimpiadaId)
            ->where('status', '!=', EstadoInscripcion::RECHAZADO->value)
            ->first();
    }

    public function calcularCostoInscripcion($areaId, $categoryLevelId)
    {
        // Aquí implementarías la lógica para calcular el costo
        // basado en el área y nivel seleccionados
        return 100.00; // Ejemplo de costo fijo
    }

    public function generarBoletaPago($amount)
    {
        return PaymentBill::create([
            'bill_number' => 'BILL-' . Str::random(8),
            'amount' => $amount,
            'status' => 'pending',
            'due_date' => Carbon::now()->addDays(7),
        ]);
    }

    public function crearProcesoInscripcion(array $data)
    {
        // Calcular el costo de la inscripción
        $cost = $this->calcularCostoInscripcion($data['area_id'], $data['category_level_id']);

        // Generar la boleta de pago
        $paymentBill = $this->generarBoletaPago($cost);

        // Crear el proceso de inscripción
        return RegistrationProcess::create([
            'competitor_id' => $data['competitor_id'],
            'tutor_id' => $data['tutor_id'],
            'olimpiada_id' => $data['olimpiada_id'],
            'area_id' => $data['area_id'],
            'category_level_id' => $data['category_level_id'],
            'payment_bill_id' => $paymentBill->id,
            'status' => EstadoInscripcion::PENDIENTE->value
        ]);
    }

    public function actualizarEstadoPago($paymentBillId, array $paymentData)
    {
        $paymentBill = PaymentBill::findOrFail($paymentBillId);

        $paymentBill->update([
            'status' => 'paid',
            'payment_date' => now(),
            'payment_method' => $paymentData['payment_method'],
            'transaction_id' => $paymentData['transaction_id'],
            'payment_details' => $paymentData['payment_details']
        ]);

        // Actualizar el estado del proceso de inscripción
        $registrationProcess = RegistrationProcess::where('payment_bill_id', $paymentBillId)->first();
        if ($registrationProcess) {
            $registrationProcess->update(['status' => EstadoInscripcion::INSCRITO->value]);
        }

        return [
            'payment' => $paymentBill,
            'registration' => $registrationProcess
        ];
    }

    public function obtenerEstadoInscripcion($registrationId)
    {
        return RegistrationProcess::with(['competitor', 'tutor', 'olimpiada', 'area', 'categoryLevel', 'paymentBill'])
            ->findOrFail($registrationId);
    }

    public function rechazarInscripcion($registrationId, string $reason)
    {
        $registration = RegistrationProcess::findOrFail($registrationId);

        $registration->update([
            'status' => EstadoInscripcion::RECHAZADO->value,
            'rejection_reason' => $reason
        ]);

        return $registration;
    }
}
