<?php

namespace App\Services;

use App\Enums\EstadoInscripcion;
use App\Models\Competitor;
use App\Models\CompetidorAreaNivel;
use App\Models\CompetidorTutor;
use App\Models\FileCargaMasiva;
use App\Models\GrupoCompetidores;
use App\Models\RegistrationProcess;
use App\Models\Tutor;
use App\Repositories\ProcesoInscripcionRepository;
use App\Services\Helpers\InscripcionHelper;
use Exception;
use Illuminate\Http\UploadedFile;

class InscripcionGrupalService
{
    protected $procesoRepository;
    protected $excelProcessor;

    public function __construct(ProcesoInscripcionRepository $procesoRepository, ExcelProcessorService $excelProcessor)
    {
        $this->procesoRepository = $procesoRepository;
        $this->excelProcessor = $excelProcessor;
    }

    /**
     * Registra un tutor en el proceso de inscripción grupal
     *
     * @param RegistrationProcess $proceso
     * @param array $datos Datos del tutor
     * @param array $competidoresIds IDs de los competidores asociados
     * @param int $usuarioId ID del usuario que registra
     * @return Tutor
     */
    public function registrarTutor(RegistrationProcess $proceso, array $datos, array $competidoresIds, int $usuarioId)
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'registrar tutores');

        if ($proceso->status !== EstadoInscripcion::PENDIENTE) {
            throw new Exception('El proceso de inscripción no está en estado pendiente');
        }

        if (empty($competidoresIds) && $proceso->type === 'grupal') {
            // En inscripción grupal, podemos registrar tutores sin competidores inicialmente
            $competidoresIds = [];
        }

        $tutor = Tutor::updateOrCreate(
            ['correo_electronico' => $datos['correo_electronico']],
            [
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'telefono' => $datos['telefono'],
            ]
        );

        // Si hay competidores asociados, crear las relaciones
        if (!empty($competidoresIds)) {
            foreach ($competidoresIds as $competidorId) {
                if (!$this->procesoRepository->competidorPerteneceAProceso($proceso->id, $competidorId)) {
                    throw new Exception("El competidor no pertenece a este proceso de inscripción");
                }

                CompetidorTutor::create([
                    'competidor_id' => $competidorId,
                    'tutor_id' => $tutor->id,
                    'es_principal' => $datos['es_principal'] ?? false,
                    'relacion' => $datos['relacion'] ?? 'Tutor',
                    'activo' => true
                ]);
            }
        }

        return $tutor;
    }

    /**
     * Registra múltiples tutores en un proceso de inscripción grupal
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param array $tutores Lista de datos de tutores
     * @param int $usuarioId ID del usuario que registra
     * @return array Tutores registrados
     */
    public function registrarMultiplesTutores(RegistrationProcess $proceso, array $tutores, int $usuarioId)
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'registrar múltiples tutores');

        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        $tutoresRegistrados = [];

        foreach ($tutores as $datosTutor) {
            // Para inscripciones grupales, simplemente creamos o actualizamos los tutores
            // Las relaciones con competidores se manejarán cuando se asignen las áreas y niveles
            $tutor = Tutor::updateOrCreate(
                ['correo_electronico' => $datosTutor['correo_electronico']],
                [
                    'nombres' => $datosTutor['nombres'],
                    'apellidos' => $datosTutor['apellidos'],
                    'telefono' => $datosTutor['telefono'],
                ]
            );

            $tutoresRegistrados[] = $tutor;
        }

        return $tutoresRegistrados;
    }

    /**
     * Procesa un archivo Excel para registro masivo de competidores
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param UploadedFile $file Archivo Excel
     * @return array Resultado del procesamiento
     */
    public function procesarArchivoExcel(RegistrationProcess $proceso, UploadedFile $file)
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'cargar archivo excel');

        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        // Guardar el archivo
        $fileCarga = $this->excelProcessor->guardarArchivo($file, $proceso);

        // Procesar el archivo
        $resultado = $this->excelProcessor->procesarArchivo($fileCarga);

        return $resultado;
    }

    /**
     * Crea un grupo de competidores para organizar una inscripción grupal
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param array $datos Datos del grupo
     * @return GrupoCompetidores
     */
    public function crearGrupoCompetidores(RegistrationProcess $proceso, array $datos)
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'crear grupo de competidores');

        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        $grupo = GrupoCompetidores::create([
            'registration_process_id' => $proceso->id,
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null
        ]);

        // Si hay competidores, asociarlos al grupo
        if (!empty($datos['competidores_ids'])) {
            foreach ($datos['competidores_ids'] as $competidorId) {
                if (!$this->procesoRepository->competidorPerteneceAProceso($proceso->id, $competidorId)) {
                    throw new Exception("El competidor con ID {$competidorId} no pertenece a este proceso de inscripción");
                }
            }
            $grupo->competidores()->attach($datos['competidores_ids']);
        }

        return $grupo;
    }

    /**
     * Asigna áreas y niveles a múltiples competidores
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param array $asignaciones Lista de asignaciones con estructura: [['competidor_id' => int, 'area_id' => int, 'nivel_id' => int], ...]
     * @return array Resultado de las asignaciones
     */
    public function asignarAreaNivelMultiples(RegistrationProcess $proceso, array $asignaciones)
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'asignar áreas y niveles');

        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        $resultados = [];

        foreach ($asignaciones as $datos) {
            $competidorId = $datos['competidor_id'];

            if (!$this->procesoRepository->competidorPerteneceAProceso($proceso->id, $competidorId)) {
                throw new Exception("El competidor con ID {$competidorId} no pertenece a este proceso de inscripción");
            }

            $areaId = $datos['area_id'];
            $nivelId = $datos['nivel_id'];

            // Comprobar que el área es válida para la olimpiada
            $areaValidaEnConditions = $proceso->olimpiada->conditions()
                ->where('area_id', $areaId)
                ->exists();

            if (!$areaValidaEnConditions) {
                throw new Exception("El área con ID {$areaId} no es válida para esta olimpiada");
            }

            // Verificar que el nivel existe para el área seleccionada
            // Aquí se necesitaría implementar la lógica para verificar que el nivel es válido para el área

            // Guardar asignación
            $asignacion = CompetidorAreaNivel::create([
                'competitor_id' => $competidorId,
                'area_id' => $areaId,
                'category_level_id' => $nivelId,
                'registration_process_id' => $proceso->id
            ]);

            // CREAR LAS RELACIONES TUTOR-COMPETIDOR FALTANTES
            // Como se prometió en el comentario de registrarMultiplesTutores (líneas 97-98),
            // aquí es donde se deben crear las relaciones entre tutores y competidores
            $this->crearRelacionesTutorCompetidor($proceso, $competidorId);

            $resultados[] = [
                'competidor_id' => $competidorId,
                'area_id' => $areaId,
                'nivel_id' => $nivelId,
                'asignacion_id' => $asignacion->id
            ];
        }

        return $resultados;
    }

    /**
     * Genera un resumen completo de la inscripción grupal
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @return array Datos del resumen
     */
    public function generarResumenGrupal(RegistrationProcess $proceso)
    {
        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        // Obtener competidores del proceso
        $competidores = $this->procesoRepository->obtenerCompetidores($proceso->id);

        // Obtener tutores asociados a los competidores
        $tutoresIds = [];
        foreach ($competidores as $competidor) {
            foreach ($competidor->tutores as $tutor) {
                $tutoresIds[$tutor->id] = $tutor;
            }
        }

        // Obtener asignaciones de áreas y niveles
        $asignaciones = CompetidorAreaNivel::where('registration_process_id', $proceso->id)
            ->with(['competidor', 'area', 'nivel'])
            ->get();

        // Calcular costo total
        $precioBase = $proceso->olimpiada->costo_base ?? 50; // Valor por defecto
        $costoTotal = $precioBase * count($competidores);

        // Agrupar competidores por área
        $competidoresPorArea = [];
        foreach ($asignaciones as $asignacion) {
            $areaId = $asignacion->area_id;
            if (!isset($competidoresPorArea[$areaId])) {
                $competidoresPorArea[$areaId] = [
                    'area' => $asignacion->area->nombre,
                    'competidores' => []
                ];
            }

            $competidoresPorArea[$areaId]['competidores'][] = [
                'id' => $asignacion->competidor->id,
                'nombre_completo' => $asignacion->competidor->nombres . ' ' . $asignacion->competidor->apellidos,
                'nivel' => $asignacion->nivel->name
            ];
        }

        return [
            'proceso' => [
                'id' => $proceso->id,
                'tipo' => $proceso->type,
                'olimpiada' => $proceso->olimpiada->nombre,
                'fecha_inicio' => $proceso->start_date
            ],
            'competidores' => $competidores->map(function ($competidor) {
                return [
                    'id' => $competidor->id,
                    'nombres' => $competidor->nombres,
                    'apellidos' => $competidor->apellidos,
                    'documento_identidad' => $competidor->documento_identidad,
                    'colegio' => $competidor->colegio,
                    'curso' => $competidor->curso . ' ' . $competidor->nivel
                ];
            }),
            'tutores' => collect($tutoresIds)->values()->map(function ($tutor) {
                return [
                    'id' => $tutor->id,
                    'nombres' => $tutor->nombres,
                    'apellidos' => $tutor->apellidos,
                    'correo_electronico' => $tutor->correo_electronico,
                    'telefono' => $tutor->telefono
                ];
            }),
            'areas_niveles' => $competidoresPorArea,
            'total_competidores' => count($competidores),
            'costo_total' => $costoTotal
        ];
    }

    /**
     * Descarga una plantilla de Excel para la carga masiva de competidores
     *
     * @return string Ruta del archivo de plantilla
     */
    public function descargarPlantillaExcel()
    {
        return $this->excelProcessor->generarPlantillaExcel();
    }

    /**
     * Registra múltiples competidores manualmente
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param array $competidores Lista de datos de competidores
     * @return array Competidores registrados
     */
    public function registrarMultiplesCompetidores(RegistrationProcess $proceso, array $competidores)
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'registrar múltiples competidores');

        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        $competidoresRegistrados = [];

        foreach ($competidores as $datos) {
            // Validar datos obligatorios
            if (empty($datos['nombres']) || empty($datos['apellidos']) || empty($datos['documento_identidad'])) {
                throw new Exception('Los campos nombres, apellidos y documento de identidad son obligatorios');
            }

            // Verificar que no exista un competidor con el mismo documento
            $existente = Competitor::where('documento_identidad', $datos['documento_identidad'])->first();
            if ($existente) {
                throw new Exception("Ya existe un competidor con el documento de identidad {$datos['documento_identidad']}");
            }

            // Crear competidor
            $competidor = Competitor::create([
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'documento_identidad' => $datos['documento_identidad'],
                'fecha_nacimiento' => $datos['fecha_nacimiento'],
                'correo_electronico' => $datos['correo_electronico'],
                'colegio' => $datos['colegio'],
                'curso' => explode(' ', $datos['curso'])[0],
                'nivel' => explode(' ', $datos['curso'])[1],
                'provincia' => $datos['provincia']
            ]);

            // Asociar al proceso de inscripción
            $this->procesoRepository->agregarCompetidor($proceso->id, $competidor->id);

            $competidoresRegistrados[] = $competidor;
        }

        return $competidoresRegistrados;
    }

    /**
     * Verifica qué competidores ya existen en la base de datos
     *
     * @param array $competidores Lista de competidores a verificar
     * @return array Resultado de la verificación
     */
    public function verificarCompetidoresExistentes(array $competidores)
    {
        $resultado = [
            'competidores_existentes' => [],
            'competidores_nuevos' => [],
            'total_existentes' => 0,
            'total_nuevos' => 0
        ];

        foreach ($competidores as $index => $datosCompetidor) {
            $competidorInfo = [
                'indice' => $index,
                'documento_identidad' => $datosCompetidor['documento_identidad'],
                'correo_electronico' => $datosCompetidor['correo_electronico'],
                'nombres' => $datosCompetidor['nombres'] ?? '',
                'apellidos' => $datosCompetidor['apellidos'] ?? ''
            ];

            // Verificar por documento de identidad
            $existePorDocumento = Competitor::where('documento_identidad', $datosCompetidor['documento_identidad'])->first();

            // Verificar por correo electrónico
            $existePorCorreo = Competitor::where('correo_electronico', $datosCompetidor['correo_electronico'])->first();

            if ($existePorDocumento || $existePorCorreo) {
                $competidorExistente = $existePorDocumento ?? $existePorCorreo;

                $competidorInfo['existe'] = true;
                $competidorInfo['competidor_existente'] = [
                    'id' => $competidorExistente->id,
                    'nombres' => $competidorExistente->nombres,
                    'apellidos' => $competidorExistente->apellidos,
                    'documento_identidad' => $competidorExistente->documento_identidad,
                    'correo_electronico' => $competidorExistente->correo_electronico,
                    'colegio' => $competidorExistente->colegio,
                    'curso' => $competidorExistente->curso,
                    'provincia' => $competidorExistente->provincia
                ];

                $competidorInfo['motivo_duplicado'] = [];
                if ($existePorDocumento) {
                    $competidorInfo['motivo_duplicado'][] = 'documento_identidad';
                }
                if ($existePorCorreo) {
                    $competidorInfo['motivo_duplicado'][] = 'correo_electronico';
                }

                $resultado['competidores_existentes'][] = $competidorInfo;
                $resultado['total_existentes']++;
            } else {
                $competidorInfo['existe'] = false;
                $resultado['competidores_nuevos'][] = $competidorInfo;
                $resultado['total_nuevos']++;
            }
        }

        return $resultado;
    }

    /**
     * Registra competidores saltándose los duplicados
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param array $competidores Lista de competidores
     * @param array $indicesOmitir Índices de competidores a omitir
     * @return array Competidores registrados
     */
    public function registrarCompetidoresSinDuplicados(RegistrationProcess $proceso, array $competidores, array $indicesOmitir = [])
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'registrar múltiples competidores');

        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        $competidoresRegistrados = [];

        foreach ($competidores as $index => $datos) {
            // Saltar los competidores marcados para omitir
            if (in_array($index, $indicesOmitir)) {
                continue;
            }

            // Validar datos obligatorios
            if (empty($datos['nombres']) || empty($datos['apellidos']) || empty($datos['documento_identidad'])) {
                throw new Exception('Los campos nombres, apellidos y documento de identidad son obligatorios');
            }

            // Verificar que no exista un competidor con el mismo documento (por seguridad)
            $existente = Competitor::where('documento_identidad', $datos['documento_identidad'])->first();
            if ($existente) {
                continue; // Saltar este competidor
            }

            // Crear competidor
            $competidor = Competitor::create([
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'documento_identidad' => $datos['documento_identidad'],
                'fecha_nacimiento' => $datos['fecha_nacimiento'],
                'correo_electronico' => $datos['correo_electronico'],
                'colegio' => $datos['colegio'],
                'curso' => explode(' ', $datos['curso'])[0],
                'nivel' => explode(' ', $datos['curso'])[1],
                'provincia' => $datos['provincia']
            ]);

            // Asociar al proceso de inscripción
            $this->procesoRepository->agregarCompetidor($proceso->id, $competidor->id);

            $competidoresRegistrados[] = [
                'id' => $competidor->id,
                'nombres' => $competidor->nombres,
                'apellidos' => $competidor->apellidos,
                'documento_identidad' => $competidor->documento_identidad,
                'correo_electronico' => $competidor->correo_electronico,
                'indice_original' => $index
            ];
        }

        return $competidoresRegistrados;
    }

    /**
     * Asocia competidores existentes a un proceso de inscripción
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param array $competidoresIds IDs de competidores existentes
     * @return array Competidores asociados
     */
    public function asociarCompetidoresExistentes(RegistrationProcess $proceso, array $competidoresIds)
    {
        InscripcionHelper::verificarProcesoActivo($proceso, 'asociar competidores existentes');

        if ($proceso->type !== 'grupal') {
            throw new Exception('Esta función solo está disponible para inscripciones grupales');
        }

        $competidoresAsociados = [];

        foreach ($competidoresIds as $competidorId) {
            $competidor = Competitor::find($competidorId);
            if (!$competidor) {
                throw new Exception("No se encontró el competidor con ID {$competidorId}");
            }

            // Verificar si ya está asociado al proceso
            $yaAsociado = $this->procesoRepository->competidorPerteneceAProceso($proceso->id, $competidorId);
            if (!$yaAsociado) {
                $this->procesoRepository->agregarCompetidor($proceso->id, $competidorId);
            }

            $competidoresAsociados[] = [
                'id' => $competidor->id,
                'nombres' => $competidor->nombres,
                'apellidos' => $competidor->apellidos,
                'documento_identidad' => $competidor->documento_identidad,
                'correo_electronico' => $competidor->correo_electronico,
                'ya_asociado' => $yaAsociado
            ];
        }

        return $competidoresAsociados;
    }

    /**
     * Crea las relaciones faltantes entre tutores y competidores para un proceso de inscripción grupal
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param int $competidorId ID del competidor
     * @return void
     */
    private function crearRelacionesTutorCompetidor(RegistrationProcess $proceso, int $competidorId)
    {
        // Obtener todos los tutores registrados para este proceso
        // Los tutores se registran a nivel de proceso, no de competidor específico en inscripciones grupales
        $tutores = Tutor::whereHas('competidores', function ($query) use ($proceso) {
            $query->whereHas('detallesInscripcion', function ($subQuery) use ($proceso) {
                $subQuery->where('register_process_id', $proceso->id);
            });
        })->get();

        // Si no hay tutores asociados al proceso, buscar todos los tutores del proceso
        if ($tutores->isEmpty()) {
            // Obtener todos los competidores del proceso
            $competidoresDelProceso = $this->procesoRepository->obtenerCompetidores($proceso->id);
            $idsCompetidoresDelProceso = $competidoresDelProceso->pluck('id')->toArray();

            // Buscar tutores que tengan relación con cualquier competidor del proceso
            $tutores = Tutor::whereHas('competidores', function ($query) use ($idsCompetidoresDelProceso) {
                $query->whereIn('competitor.id', $idsCompetidoresDelProceso);
            })->get();
        }

        // Si aún no hay tutores, obtener todos los tutores creados recientemente para este proceso
        // (esto maneja el caso donde los tutores se registraron sin competidores específicos)
        if ($tutores->isEmpty()) {
            $tutores = Tutor::where('created_at', '>=', $proceso->created_at)->get();
        }

        foreach ($tutores as $tutor) {
            // Verificar si ya existe una relación entre este tutor y competidor
            $relacionExistente = CompetidorTutor::where('competidor_id', $competidorId)
                ->where('tutor_id', $tutor->id)
                ->first();

            if (!$relacionExistente) {
                // Crear la relación faltante
                CompetidorTutor::create([
                    'competidor_id' => $competidorId,
                    'tutor_id' => $tutor->id,
                    'es_principal' => true, // El primer tutor se marca como principal
                    'relacion' => 'Tutor',
                    'activo' => true
                ]);
            }
        }
    }

    /**
     * Crea las relaciones faltantes entre tutores y competidores para la carga CSV
     * Método público para ser llamado desde ExcelProcessorService
     *
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @param int $competidorId ID del competidor
     * @return void
     */
    public function crearRelacionesTutorCompetidorParaCSV(RegistrationProcess $proceso, int $competidorId)
    {
        $this->crearRelacionesTutorCompetidor($proceso, $competidorId);
    }
}
