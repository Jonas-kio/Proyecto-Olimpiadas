<?php

namespace App\Services;

use App\Models\Competitor;
use App\Models\Tutor;
use App\Models\RegistrationProcess;
use App\Models\PaymentBill;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RegistrationService
{
    public function createCompetitor(array $data)
    {
        return Competitor::create($data);
    }

    public function createTutor(array $data)
    {
        return Tutor::create($data);
    }

    public function generatePaymentBill($amount)
    {
        return PaymentBill::create([
            'bill_number' => 'BILL-' . Str::random(8),
            'amount' => $amount,
            'status' => 'pending',
            'due_date' => Carbon::now()->addDays(7),
        ]);
    }

    public function createRegistrationProcess(array $data)
    {
        // Obtener el costo basado en el área y nivel
        $cost = $this->calculateRegistrationCost($data['area_id'], $data['category_level_id']);

        // Generar la boleta de pago
        $paymentBill = $this->generatePaymentBill($cost);

        // Crear el proceso de inscripción
        return RegistrationProcess::create([
            'competitor_id' => $data['competitor_id'],
            'tutor_id' => $data['tutor_id'],
            'olimpiada_id' => $data['olimpiada_id'],
            'area_id' => $data['area_id'],
            'category_level_id' => $data['category_level_id'],
            'payment_bill_id' => $paymentBill->id,
            'status' => 'pending'
        ]);
    }

    private function calculateRegistrationCost($areaId, $categoryLevelId)
    {
        // Aquí implementarías la lógica para calcular el costo
        // basado en el área y nivel seleccionados
        return 100.00; // Ejemplo de costo fijo
    }

    public function updatePaymentStatus($paymentBillId, $paymentData)
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
            $registrationProcess->update(['status' => 'approved']);
        }

        return $paymentBill;
    }
}
