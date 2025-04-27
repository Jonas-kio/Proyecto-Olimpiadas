<?php

namespace App\Services;

use App\Enums\BoletaEstado;
use App\Enums\EstadoInscripcion;
use App\Events\BoletaGenerada;
use App\Models\Boleta;
use App\Models\CompetidorTutor;
use App\Models\Cost;
use App\Models\DetalleInscripcion;
use App\Models\RegistrationProcess;
use App\Repositories\ProcesoInscripcionRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Str;

class BoletaService
{
    protected $procesoRepository;

    public function __construct(ProcesoInscripcionRepository $procesoRepository)
    {
        $this->procesoRepository = $procesoRepository;
    }


    public function generarBoleta(RegistrationProcess $proceso)
    {

        if ($proceso->status->value !== EstadoInscripcion::PENDIENTE->value) {
            throw new \Exception('El proceso de inscripción no está en estado válido para generar boleta');
        }


        $competidoresIds = $this->procesoRepository->obtenerIdsCompetidores($proceso->id);
        if (empty($competidoresIds)) {
            throw new \Exception('El proceso de inscripción no tiene competidores asociados');
        }

        $areaId = $this->procesoRepository->obtenerAreaSeleccionada($proceso->id);
        $nivelId = $this->procesoRepository->obtenerNivelSeleccionado($proceso->id);

        if (!$areaId || !$nivelId) {
            throw new \Exception('Debe seleccionar un área y nivel para generar la boleta');
        }

        DB::beginTransaction();

        try {

            $costo = Cost::where('area_id', $areaId)
                ->where('category_id', $nivelId)
                ->firstOrFail();

            if (!isset($costo->price)) {
                throw new \Exception('El costo no tiene un precio definido.');
            }

            $montoTotal = 0;

            foreach ($competidoresIds as $competidorId) {
                DetalleInscripcion::create([
                    'register_process_id' => $proceso->id,
                    'competidor_id' => $competidorId,
                    'area_id' => $areaId,
                    'categoria_id' => $nivelId,
                    'monto' => $costo->price,
                    'status' => true,
                    'estado' => 'pendiente'
                ]);

                $montoTotal += $costo->price;
            }

            //$proceso->update(['status' => EstadoInscripcion::INSCRITO]);

            $diasExpiracion = config('app.boleta_dias_expiracion', 15);
            $boleta = Boleta::create([
                'registration_process_id' => $proceso->id,
                'numero_boleta' => $this->generarCodigoBoleta(),
                'monto_total' => $montoTotal,
                'fecha_emision' => now(),
                'fecha_expiracion' => now()->addDays($diasExpiracion),
                'estado' => BoletaEstado::PENDIENTE->value,
            ]);

            DB::commit();

            event(new BoletaGenerada($boleta));

            return $boleta;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error al generar la boleta: ' . $e->getMessage());
        }
    }

    /**
     * Genera un código único para la boleta
     */
    protected function generarCodigoBoleta()
    {
        $fechaActual = Carbon::now()->format('Ymd');
        $codigo = 'BOL-' . $fechaActual . '-' . strtoupper(Str::random(6));

        // Verificar que el código sea único
        while (Boleta::where('numero_boleta', $codigo)->exists()) {
            $codigo = 'BOL-' . $fechaActual . '-' . strtoupper(Str::random(6));
        }

        return $codigo;
    }

    /**
     * Obtiene los datos completos de una boleta de pago
     */
    public function obtenerDatosBoleta($boletaId)
    {
        $boleta = Boleta::with([
            'proceso_inscripcion',
            'proceso_inscripcion.olimpiada',
            'proceso_inscripcion.usuario',
            'proceso_inscripcion.detalles_inscripcion.competidor.colegio',
            'proceso_inscripcion.detalles_inscripcion.area',
            'proceso_inscripcion.detalles_inscripcion.nivel_categoria'
        ])->findOrFail($boletaId);

        $proceso = $boleta->proceso_inscripcion;
        $detalles = $proceso->detalles_inscripcion;

        $competidoresIds = $detalles->pluck('competidor_id')->toArray();

        $tutoresPorCompetidor = [];
        $competidoresTutores = CompetidorTutor::whereIn('competidor_id', $competidoresIds)
            ->with('tutor')
            ->get()
            ->groupBy('competidor_id');

        foreach ($competidoresTutores as $competidorId => $tutores) {
            $tutoresPorCompetidor[$competidorId] = $tutores->map(function ($ct) {
                return [
                    'id' => $ct->tutor->id,
                    'nombres' => $ct->tutor->nombres,
                    'apellidos' => $ct->tutor->apellidos,
                    'correo' => $ct->tutor->correo,
                    'telefono' => $ct->tutor->telefono,
                    'es_principal' => $ct->es_principal,
                    'relacion' => $ct->relacion
                ];
            })->toArray();
        }

        // Construir datos de competidores con sus detalles
        $competidoresData = [];
        foreach ($detalles as $detalle) {
            $competidorId = $detalle->competidor->id;
            $competidoresData[] = [
                'id' => $competidorId,
                'nombres' => $detalle->competidor->nombres,
                'apellidos' => $detalle->competidor->apellidos,
                'nombre_completo' => $detalle->competidor->nombres . ' ' . $detalle->competidor->apellidos,
                'ci' => $detalle->competidor->ci,
                'fecha_nacimiento' => $detalle->competidor->fecha_nacimiento,
                'correo' => $detalle->competidor->correo,
                'telefono' => $detalle->competidor->telefono,
                'curso' => $detalle->competidor->curso,
                'colegio' => [
                    'id' => $detalle->competidor->colegio->id,
                    'nombre' => $detalle->competidor->colegio->nombre
                ],
                'area' => [
                    'id' => $detalle->area->id,
                    'nombre' => $detalle->area->nombre
                ],
                'nivel' => [
                    'id' => $detalle->nivel_categoria->id,
                    'nombre' => $detalle->nivel_categoria->nombre
                ],
                'monto' => $detalle->monto,
                'tutores' => $tutoresPorCompetidor[$competidorId] ?? []
            ];
        }

        // Construir respuesta
        return [
            'boleta' => [
                'id' => $boleta->id,
                'codigo' => $boleta->codigo,
                'monto_total' => $boleta->monto_total,
                'fecha_emision' => $boleta->fecha_emision->format('Y-m-d H:i:s'),
                'fecha_emision_formateada' => $boleta->fecha_emision->format('d/m/Y H:i'),
                'fecha_expiracion' => $boleta->fecha_expiracion->format('Y-m-d H:i:s'),
                'fecha_expiracion_formateada' => $boleta->fecha_expiracion->format('d/m/Y H:i'),
                'estado' => $boleta->estado
            ],
            'proceso' => [
                'id' => $proceso->id,
                'tipo' => $proceso->tipo,
                'estado' => $proceso->estado,
                'fecha_inicio' => $proceso->fecha_inicio->format('Y-m-d H:i:s')
            ],
            'olimpiada' => [
                'id' => $proceso->olimpiada->id,
                'nombre' => $proceso->olimpiada->nombre,
                'descripcion' => $proceso->olimpiada->descripcion,
                'modalidad' => $proceso->olimpiada->modalidad
            ],
            'competidores' => $competidoresData,
            'monto_total_formateado' => number_format($boleta->monto_total, 2),
            'tipo_inscripcion' => ucfirst($proceso->tipo)
        ];
    }
}
