<?php

namespace App\Http\Controllers;

use App\Services\RegistrationService;
use App\Models\RegistrationProcess;
use App\Models\PaymentBill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RegistrationController extends Controller
{
    protected $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    public function registerCompetitor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:competitor,email',
            'phone' => 'required|string|max:20',
            'school_id' => 'required|exists:school,id',
            'grade' => 'required|string|max:50',
            'birth_date' => 'required|date',
            'document_type' => 'required|string|max:50',
            'document_number' => 'required|string|max:50|unique:competitor,document_number',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $competitor = $this->registrationService->createCompetitor($request->all());

        return response()->json([
            'message' => 'Competidor registrado exitosamente',
            'competitor' => $competitor
        ], 201);
    }

    public function registerTutor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:tutor,email',
            'phone' => 'required|string|max:20',
            'document_type' => 'required|string|max:50',
            'document_number' => 'required|string|max:50|unique:tutor,document_number',
            'relationship' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tutor = $this->registrationService->createTutor($request->all());

        return response()->json([
            'message' => 'Tutor registrado exitosamente',
            'tutor' => $tutor
        ], 201);
    }

    public function completeRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'competitor_id' => 'required|exists:competitor,id',
            'tutor_id' => 'required|exists:tutor,id',
            'olimpiada_id' => 'required|exists:olimpiadas,id',
            'area_id' => 'required|exists:area,id',
            'category_level_id' => 'required|exists:category_level,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $registrationProcess = $this->registrationService->createRegistrationProcess($request->all());

        return response()->json([
            'message' => 'Proceso de inscripción completado exitosamente',
            'registration' => $registrationProcess,
            'payment_bill' => $registrationProcess->paymentBill
        ], 201);
    }

    public function updatePayment(Request $request, $paymentBillId)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string|max:100',
            'transaction_id' => 'required|string|max:255',
            'payment_details' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $paymentBill = $this->registrationService->updatePaymentStatus($paymentBillId, $request->all());

        return response()->json([
            'message' => 'Pago registrado exitosamente',
            'payment' => $paymentBill
        ]);
    }

    public function getRegistrationStatus($registrationId)
    {
        $registration = RegistrationProcess::with(['competitor', 'tutor', 'olimpiada', 'area', 'categoryLevel', 'paymentBill'])
            ->findOrFail($registrationId);

        return response()->json([
            'registration' => $registration
        ]);
    }
}
