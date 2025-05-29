<?php

namespace App\Services;

use App\Enums\BoletaEstado;
use App\Enums\EstadoInscripcion;
use App\Events\BoletaGenerada;
use App\Models\Boleta;
use App\Models\CompetidorAreaNivel;
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

        DB::beginTransaction();

        try {
            $montoTotal = 0;

            if ($proceso->type === 'grupal') {
                // Para inscripciones grupales, cada competidor puede tener diferente área y nivel
                $montoTotal = $this->procesarInscripcionGrupal($proceso, $competidoresIds);
            } else {
                // Para inscripciones individuales, todos tienen la misma área y nivel
                $montoTotal = $this->procesarInscripcionIndividual($proceso, $competidoresIds);
            }

            $diasExpiracion = config('app.boleta_dias_expiracion', 15);
            $boleta = Boleta::create([
                'registration_process_id' => $proceso->id,
                'numero_boleta' => $this->generarCodigoBoleta($proceso->type), // Pasamos el tipo de proceso
                'monto_total' => $montoTotal,
                'fecha_emision' => now(),
                'fecha_expiracion' => now()->addDays($diasExpiracion),
                'estado' => BoletaEstado::PENDIENTE->value,
            ]);

            // Desactivar el proceso de inscripción para evitar modificaciones
            $this->procesoRepository->actualizarEstadoActivacion($proceso->id, false);

            DB::commit();

            event(new BoletaGenerada($boleta));

            return $boleta;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error al generar la boleta: ' . $e->getMessage());
        }
    }

    protected function generarCodigoBoleta($tipo = null)
    {
        $fechaActual = Carbon::now()->format('Ymd');


        $prefijo = 'BOL';
        if ($tipo === 'individual') {
            $prefijo = 'BOL-IND';
        } elseif ($tipo === 'grupal') {
            $prefijo = 'BOL-GRP';
        }

        $codigo = $prefijo . '-' . $fechaActual . '-' . strtoupper(Str::random(6));

        while (Boleta::where('numero_boleta', $codigo)->exists()) {
            $codigo = $prefijo . '-' . $fechaActual . '-' . strtoupper(Str::random(6));
        }

        return $codigo;
    }

    /**
     * Procesa inscripción individual donde todos los competidores tienen la misma área y nivel
     */
    protected function procesarInscripcionIndividual(RegistrationProcess $proceso, array $competidoresIds)
    {
        $areaId = $this->procesoRepository->obtenerAreaSeleccionada($proceso->id);
        $nivelId = $this->procesoRepository->obtenerNivelSeleccionado($proceso->id);

        if (!$areaId || !$nivelId) {
            throw new \Exception('Debe seleccionar un área y nivel para generar la boleta');
        }

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

        return $montoTotal;
    }

    /**
     * Procesa inscripción grupal donde cada competidor puede tener diferentes áreas y niveles
     */
    protected function procesarInscripcionGrupal(RegistrationProcess $proceso, array $competidoresIds)
    {
        // Obtener las asignaciones de área y nivel para cada competidor
        $asignaciones = CompetidorAreaNivel::where('registration_process_id', $proceso->id)
            ->whereIn('competitor_id', $competidoresIds)
            ->get();

        if ($asignaciones->isEmpty()) {
            throw new \Exception('No se encontraron asignaciones de área y nivel para los competidores en este proceso de inscripción grupal');
        }

        // Verificar que todos los competidores tengan asignaciones
        $competidoresConAsignacion = $asignaciones->pluck('competitor_id')->unique()->toArray();
        $competidoresSinAsignacion = array_diff($competidoresIds, $competidoresConAsignacion);

        if (!empty($competidoresSinAsignacion)) {
            throw new \Exception('Los siguientes competidores no tienen asignaciones de área y nivel: ' . implode(', ', $competidoresSinAsignacion));
        }

        $montoTotal = 0;

        foreach ($asignaciones as $asignacion) {
            // Obtener el costo para esta combinación específica de área y nivel
            $costo = Cost::where('area_id', $asignacion->area_id)
                ->where('category_id', $asignacion->category_level_id)
                ->first();

            if (!$costo) {
                throw new \Exception("No se encontró un costo definido para el área {$asignacion->area_id} y nivel {$asignacion->category_level_id}");
            }

            if (!isset($costo->price)) {
                throw new \Exception("El costo para área {$asignacion->area_id} y nivel {$asignacion->category_level_id} no tiene un precio definido");
            }

            // Crear detalle de inscripción con la información específica del competidor
            DetalleInscripcion::create([
                'register_process_id' => $proceso->id,
                'competidor_id' => $asignacion->competitor_id,
                'area_id' => $asignacion->area_id,
                'categoria_id' => $asignacion->category_level_id,
                'monto' => $costo->price,
                'status' => true,
                'estado' => 'pendiente'
            ]);

            $montoTotal += $costo->price;
        }

        return $montoTotal;
    }

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
