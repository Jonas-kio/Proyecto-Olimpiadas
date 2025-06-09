<?php

namespace App\Http\Controllers\API\reportes;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getSummary()
    {
        // Total de inscripciones (por área)
        $totalInscritos = DB::table('registration_detail')->count();

        // Participantes únicos
        $participantesUnicos = DB::table('registration_detail')
            ->distinct('competidor_id')
            ->count('competidor_id');

        // Áreas activas
        $areasActivas = DB::table('area')->where('activo', true)->count();

        // Instituciones únicas
        $instituciones = DB::table('competitor')->distinct('colegio')->count('colegio');

        return response()->json([
            'total_inscritos' => $totalInscritos,
            'participantes_unicos' => $participantesUnicos,
            'areas_activas' => $areasActivas,
            'instituciones' => $instituciones,
        ]);
    }

    public function getRecentRegistrations()
    {
        $registros = DB::table('registration_detail as rd')
            ->join('competitor as c', 'rd.competidor_id', '=', 'c.id')
            ->join('area as a', 'rd.area_id', '=', 'a.id')
            ->join('category_level as cl', 'rd.categoria_id', '=', 'cl.id')
            ->select(
                'c.nombres',
                'c.apellidos',
                'a.nombre as area',
                'cl.name as nivel',
                'rd.created_at'
            )
            ->orderBy('rd.created_at', 'desc')
            ->limit(3)
            ->get();

        return response()->json($registros);
    }

    public function getInscritosPorOlimpiada($id)
    {
        $totalInscritos = DB::table('registration_detail as rd')
            ->join('registration_process as rp', 'rd.register_process_id', '=', 'rp.id')
            ->where('rp.olimpiada_id', $id)
            ->count();

        if (!DB::table('olimpiadas')->where('id', $id)->exists()) {
            return response()->json(['error' => 'Olimpiada no encontrada'], 404);
        }

        return response()->json([
            'olimpiada_id' => $id,
            'total_inscritos' => $totalInscritos
        ]);
    }

    public function getPaymentSummary()
    {
        // Unir registration_detail con registration_process
        $detalles = DB::table('registration_detail as rd')
            ->join('registration_process as rp', 'rd.register_process_id', '=', 'rp.id')
            ->select('rd.monto', 'rp.status')
            ->get();

        // Calcular montos por estado de inscripción
        $totalPendiente = $detalles->where('status', 'pending')->sum('monto');
        $totalVerificado = $detalles->where('status', 'approved')->sum('monto');
        $totalRecaudado = ($totalVerificado + $totalPendiente);

        // Nuevo: contar registros pendientes
        $registrosPendientes = $detalles->where('status', 'pending')->count();

        // Calcular porcentaje de verificados sobre total recaudado
        $porcentajeVerificado = $totalRecaudado > 0 
            ? round(($totalVerificado / $totalRecaudado) * 100)
            : 0;

        return response()->json([
            'success' => true,
            'estado_pagos' => [
                'total_recaudado' => $totalRecaudado,
                'total_pendiente' => $totalPendiente,
                'porcentaje_verificado' => $porcentajeVerificado,
                'registros_pendientes' => $registrosPendientes,
            ]
        ]);
    }

}