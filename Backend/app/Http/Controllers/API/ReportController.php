<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RegistrationProcess;
use App\Models\Competitor;
use App\Models\RegistrationDetail;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function getInscriptionReport(Request $request)
    {
        $query = RegistrationProcess::with([
            'participante',
            'registrationDetail',
            'registrationDetail.area',
            'registrationDetail.level'
        ]);

        // Aplicar filtros si se proporcionan
        if ($request->has('area_id')) {
            $query->whereHas('registrationDetail', function($q) use ($request) {
                $q->where('area_id', $request->area_id);
            });
        }

        if ($request->has('level_id')) {
            $query->whereHas('registrationDetail', function($q) use ($request) {
                $q->where('level_id', $request->level_id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $registrations = $query->get()->map(function ($registration) {
            return [
                'id' => $registration->id,
                'competitor' => [
                    'id' => $registration->participante->id,
                    'name' => $registration->participante->name,
                    'lastname' => $registration->participante->lastname,
                    'dni' => $registration->participante->dni,
                ],
                'area' => $registration->registrationDetail->area->name,
                'level' => $registration->registrationDetail->level->name,
                'status' => $registration->status,
                'created_at' => $registration->created_at,
                'updated_at' => $registration->updated_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    public function getReportSummary()
    {
        $summary = [
            'total_registrations' => RegistrationProcess::count(),
            'by_status' => RegistrationProcess::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get(),
            'by_area' => RegistrationProcess::join('registration_details', 'registration_processes.id', '=', 'registration_details.registration_process_id')
                ->join('areas', 'registration_details.area_id', '=', 'areas.id')
                ->select('areas.name', DB::raw('count(*) as total'))
                ->groupBy('areas.name')
                ->get(),
            'by_level' => RegistrationProcess::join('registration_details', 'registration_processes.id', '=', 'registration_details.registration_process_id')
                ->join('levels', 'registration_details.level_id', '=', 'levels.id')
                ->select('levels.name', DB::raw('count(*) as total'))
                ->groupBy('levels.name')
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }
} 