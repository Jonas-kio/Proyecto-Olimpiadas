<?php

namespace App\Http\Controllers\API\reportes;

use App\Http\Controllers\Controller; // 
use App\Models\DetalleInscripcion;
use Illuminate\Http\Request;

class ReporteInscripcionesController extends Controller
{
    /**
     * Obtener datos de inscripciones con filtros aplicados
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerReporte(Request $request)
    {
        $query = DetalleInscripcion::query()
            ->with([
                'proceso_inscripcion.olimpiada', 
                'proceso_inscripcion', 
                'competidor', 
                'area', 
                'nivel_categoria'
            ])
            ->whereHas('proceso_inscripcion', function ($q) {
                $q->where('active', false);
            });

        if ($request->has('olimpiada_id') && $request->olimpiada_id !== 'Todos') {
            $query->whereHas('proceso_inscripcion', function($q) use ($request) {
                $q->where('olimpiada_id', $request->olimpiada_id);
            });
        }

        if ($request->has('area_id') && $request->area_id !== 'Todos') {
            $query->where('area_id', $request->area_id);
        }

        if ($request->has('categoria_id') && $request->categoria_id !== 'Todos') {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->has('estado') && $request->estado !== 'Todos') {
            $query->whereHas('proceso_inscripcion', function($q) use ($request) {
                $q->where('status', $request->estado);
            });
        }

        //$detalles = $query->get();
        $detalles = $query->orderBy('id', 'desc')->get();

        $resultado = $detalles->map(function ($detalle) {
            return [
                'OlimpiadaId'   => $detalle->proceso_inscripcion->olimpiada_id,
                'Olimpiada'     => $detalle->proceso_inscripcion->olimpiada->nombre,
                'Participante'  => $detalle->competidor->nombres . ' ' . $detalle->competidor->apellidos,
                'Área'          => $detalle->area->nombre,
                'Nivel'         => $detalle->nivel_categoria->name,
                'Estado'        => $detalle->proceso_inscripcion->status,
                'Fecha'         => $detalle->proceso_inscripcion->start_date->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Reporte generado correctamente.',
            'data' => $resultado
        ]);

    }

    public function resumen(Request $request)
    {
        $query = DetalleInscripcion::query()
            ->with(['proceso_inscripcion', 'area'])
            ->whereHas('proceso_inscripcion', function($q) {
                $q->where('active', false);
            });

        // Filtros dinámicos
        if ($request->filled('olimpiada_id') && $request->olimpiada_id !== 'Todos') {
            $query->whereHas('proceso_inscripcion', function($q) use ($request) {
                $q->where('olimpiada_id', $request->olimpiada_id);
            });
        }

        if ($request->filled('area_id') && $request->area_id !== 'Todos') {
            $query->where('area_id', $request->area_id);
        }

        if ($request->filled('categoria_id') && $request->categoria_id !== 'Todos') {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->filled('estado') && $request->estado !== 'Todos') {
            $query->whereHas('proceso_inscripcion', function($q) use ($request) {
                $q->where('status', $request->estado);
            });
        }

        $detalles = $query->get();

        // 🧮 Resumen por área
        $resumenPorArea = $detalles->groupBy('area.nombre')->map(function ($items, $area) {
            return [
                'area' => $area,
                'total_participantes' => $items->count()
            ];
        })->values();

        // 💰 Estado de pagos
        $totalRecaudado = $detalles->sum('monto');
        $totalPendiente = $detalles->where('proceso_inscripcion.status', 'pending')->sum('monto');
        $totalVerificado = $detalles->where('proceso_inscripcion.status', 'approved')->sum('monto');

        $porcentajeVerificado = $totalRecaudado > 0 
            ? round(($totalVerificado / $totalRecaudado) * 100)
            : 0;

        return response()->json([
            'success' => true,
            'resumen_por_area' => $resumenPorArea,
            'estado_pagos' => [
                'total_recaudado' => $totalRecaudado,
                'total_pendiente' => $totalPendiente,
                'porcentaje_verificado' => $porcentajeVerificado
            ]
        ]);
    }
}
 