<?php

namespace App\Services;

use App\Models\Area;
use App\Models\CategoryLevel;
use App\Models\Competitor;
use App\Models\CompetidorAreaNivel;
use App\Models\FileCargaMasiva;
use App\Models\RegistrationProcess;
use App\Exports\PlantillaExcelExport;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;

class ExcelProcessorService
{
    private $competidoresCreados = 0;

    /**
     * Guarda el archivo de carga masiva y registra en la base de datos
     *
     * @param UploadedFile $file Archivo subido
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @return FileCargaMasiva
     */
    public function guardarArchivo(UploadedFile $file, RegistrationProcess $proceso)
    {
        // Validar que el archivo sea de tipo Excel
        $extension = $file->getClientOriginalExtension();
        if (!in_array($extension, ['xlsx', 'xls', 'csv'])) {
            throw new Exception('El archivo debe ser de tipo Excel (xlsx, xls) o CSV.');
        }

        // Generar nombre de archivo único con la extensión correcta
        $fileName = uniqid() . '.' . $extension;
        $path = 'uploads/inscripciones/' . $fileName;

        // Guardar el archivo con la extensión correcta
        Storage::put($path, file_get_contents($file->getRealPath()));

        // Registrar en la base de datos
        $fileCarga = FileCargaMasiva::create([
            'registration_process_id' => $proceso->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'status' => 'pending',
        ]);

        return $fileCarga;
    }

    /**
     * Procesa un archivo Excel previamente guardado
     *
     * @param FileCargaMasiva $fileCarga Registro del archivo a procesar
     * @return array Resultado del procesamiento
     */
    public function procesarArchivo(FileCargaMasiva $fileCarga)
    {
        try {
            // Marcar como en procesamiento
            $fileCarga->status = 'processing';
            $fileCarga->save();

            // Simular lectura del archivo Excel (implementar lectura real según bibliotecas disponibles)
            $data = $this->leerArchivoExcel($fileCarga->file_path);

            // Validar estructura del archivo
            $this->validarEstructuraArchivo($data);

            // Procesar datos y crear competidores
            $competidoresCreados = $this->crearCompetidores($data, $fileCarga->registrationProcess);

            // Marcar como procesado
            $fileCarga->status = 'processed';
            $fileCarga->processed_at = now();
            $fileCarga->save();

            return [
                'success' => true,
                'mensaje' => 'Archivo procesado correctamente',
                'competidores_creados' => count($competidoresCreados),
                'competidores' => $competidoresCreados
            ];
        } catch (Exception $e) {
            // Registrar error
            $fileCarga->status = 'error';
            $fileCarga->error_details = $e->getMessage();
            $fileCarga->save();

            return [
                'success' => false,
                'mensaje' => 'Error al procesar el archivo',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Lee el archivo Excel y extrae sus datos
     *
     * @param string $path Ruta del archivo
     * @return array
     */
    private function leerArchivoExcel($path)
    {
        // Comprobar que el archivo existe
        if (!Storage::exists($path)) {
            throw new Exception('El archivo no existe en el almacenamiento.');
        }

        $fullPath = Storage::path($path);
        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

        try {
            // Por ahora, solo soportar CSV debido a incompatibilidades de PHPExcel con PHP moderno
            if ($extension === 'csv') {
                try {
                    return $this->leerArchivoCSV($fullPath);
                } catch (Exception $e) {
                    // Si falla el método con archivos temporales, usar método directo
                    return $this->leerArchivoCSVDirecto($fullPath);
                }
            }

            // Para archivos Excel, intentar convertir usando otra biblioteca o requerir CSV
            if (in_array($extension, ['xlsx', 'xls'])) {
                throw new Exception('Por favor, convierta el archivo Excel a formato CSV (.csv) para poder procesarlo. Los archivos Excel (.xlsx/.xls) requieren una versión más moderna de la librería de procesamiento.');
            }

            throw new Exception('Formato de archivo no soportado. Use archivos .csv');

        } catch (Exception $e) {
            // Si es una excepción que ya lanzamos, la re-lanzamos
            if (strpos($e->getMessage(), 'Falta el encabezado') !== false ||
                strpos($e->getMessage(), 'Email inválido') !== false ||
                strpos($e->getMessage(), 'Fila') !== false ||
                strpos($e->getMessage(), 'archivo Excel') !== false ||
                strpos($e->getMessage(), 'convierta el archivo') !== false) {
                throw $e;
            }

            // Para otros errores, dar un mensaje más genérico
            throw new Exception('Error al leer el archivo: ' . $e->getMessage());
        }
    }

    /**
     * Lee archivo CSV usando funciones nativas de PHP
     */
    private function leerArchivoCSV($fullPath)
    {
        // Leer todo el contenido del archivo para manejar BOM UTF-8
        $content = file_get_contents($fullPath);
        if ($content === false) {
            throw new Exception('No se pudo leer el archivo CSV.');
        }

        // Remover BOM UTF-8 si existe
        if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
            $content = substr($content, 3);
        }

        // Crear un directorio temporal personalizado en el proyecto
        $customTempDir = storage_path('app/temp');
        if (!file_exists($customTempDir)) {
            mkdir($customTempDir, 0755, true);
        }

        // Escribir contenido limpio a un archivo temporal personalizado
        $tempFile = $customTempDir . DIRECTORY_SEPARATOR . 'csv_clean_' . uniqid() . '.csv';
        $writeResult = file_put_contents($tempFile, $content);

        if ($writeResult === false) {
            throw new Exception('No se pudo crear el archivo temporal para procesar el CSV.');
        }

        // Abrir el archivo temporal limpio
        $handle = fopen($tempFile, 'r');
        if (!$handle) {
            // Limpiar archivo temporal si no se puede abrir
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
            throw new Exception('No se pudo abrir el archivo CSV temporal.');
        }

        // Detectar el separador leyendo la primera línea
        $firstLine = fgets($handle);
        rewind($handle);

        $separator = ','; // Por defecto
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $separator = ';';
        }

        $data = [];
        $headers = null;
        $rowNumber = 0;

        while (($row = fgetcsv($handle, 1000, $separator)) !== false) {
            $rowNumber++;

            if ($rowNumber === 1) {
                // Primera fila son los encabezados
                $headers = array_map('trim', $row);

                // Validar encabezados esperados
                $expectedHeaders = [
                    'nombres', 'apellidos', 'documento_identidad', 'fecha_nacimiento',
                    'correo_electronico', 'colegio', 'curso', 'provincia', 'area', 'nivel'
                ];

                foreach ($expectedHeaders as $header) {
                    if (!in_array($header, $headers)) {
                        fclose($handle);
                        if (file_exists($tempFile)) {
                            unlink($tempFile);
                        }
                        throw new Exception("Falta el encabezado requerido: '{$header}'. Encabezados encontrados: " . implode(', ', $headers));
                    }
                }
                continue;
            }

            // Procesar fila de datos
            if (empty(array_filter($row))) {
                continue; // Saltar filas vacías
            }

            $rowData = [];
            foreach ($headers as $index => $header) {
                $value = isset($row[$index]) ? trim($row[$index]) : '';

                // Procesar valores especiales
                switch ($header) {
                    case 'fecha_nacimiento':
                        $rowData[$header] = $this->procesarFechaExcel($value);
                        break;
                    case 'area':
                        // Convertir nombre de área a ID
                        $area = Area::where('nombre', $value)->first();
                        if (!$area) {
                            fclose($handle);
                            if (file_exists($tempFile)) {
                                unlink($tempFile);
                            }
                            throw new Exception("Área no encontrada en fila {$rowNumber}: {$value}. Áreas disponibles: " . Area::pluck('nombre')->implode(', '));
                        }
                        $rowData['area_id'] = $area->id;
                        break;
                    case 'nivel':
                        // Convertir nombre de nivel a ID
                        $nivel = CategoryLevel::where('name', $value)->first();
                        if (!$nivel) {
                            fclose($handle);
                            if (file_exists($tempFile)) {
                                unlink($tempFile);
                            }
                            throw new Exception("Nivel no encontrado en fila {$rowNumber}: {$value}. Niveles disponibles: " . CategoryLevel::pluck('name')->implode(', '));
                        }
                        $rowData['nivel_id'] = $nivel->id;
                        break;
                    case 'correo_electronico':
                        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            fclose($handle);
                            if (file_exists($tempFile)) {
                                unlink($tempFile);
                            }
                            throw new Exception("Email inválido en fila {$rowNumber}: {$value}");
                        }
                        $rowData[$header] = strtolower($value);
                        break;
                    default:
                        $rowData[$header] = $value;
                        break;
                }
            }

            // Validar datos mínimos
            if (empty($rowData['nombres']) || empty($rowData['apellidos']) || empty($rowData['documento_identidad'])) {
                fclose($handle);
                if (file_exists($tempFile)) {
                    unlink($tempFile);
                }
                throw new Exception("Fila {$rowNumber} tiene datos incompletos. Se requiere al menos nombres, apellidos y documento de identidad.");
            }

            $data[] = $rowData;
        }

        fclose($handle);

        // Limpiar archivo temporal personalizado
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }

        if (empty($data)) {
            throw new Exception('No se encontraron datos válidos para procesar en el archivo.');
        }

        return $data;
    }

    /**
     * Lee archivo CSV directamente desde memoria sin archivos temporales
     */
    private function leerArchivoCSVDirecto($fullPath)
    {
        // Leer todo el contenido del archivo
        $content = file_get_contents($fullPath);
        if ($content === false) {
            throw new Exception('No se pudo leer el archivo CSV.');
        }

        // Remover BOM UTF-8 si existe
        if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
            $content = substr($content, 3);
        }

        // Convertir contenido a array de líneas
        $lines = explode("\n", $content);

        // Detectar el separador usando la primera línea
        $firstLine = isset($lines[0]) ? $lines[0] : '';
        $separator = ','; // Por defecto
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $separator = ';';
        }

        $data = [];
        $headers = null;
        $rowNumber = 0;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue; // Saltar líneas vacías
            }

            $rowNumber++;

            // Parsear la línea CSV manualmente
            $row = str_getcsv($line, $separator);

            if ($rowNumber === 1) {
                // Primera fila son los encabezados
                $headers = array_map('trim', $row);

                // Validar encabezados esperados
                $expectedHeaders = [
                    'nombres', 'apellidos', 'documento_identidad', 'fecha_nacimiento',
                    'correo_electronico', 'colegio', 'curso', 'provincia', 'area', 'nivel'
                ];

                foreach ($expectedHeaders as $header) {
                    if (!in_array($header, $headers)) {
                        throw new Exception("Falta el encabezado requerido: '{$header}'. Encabezados encontrados: " . implode(', ', $headers));
                    }
                }
                continue;
            }

            // Procesar fila de datos
            if (empty(array_filter($row))) {
                continue; // Saltar filas vacías
            }

            $rowData = [];
            foreach ($headers as $index => $header) {
                $value = isset($row[$index]) ? trim($row[$index]) : '';

                // Procesar valores especiales
                switch ($header) {
                    case 'fecha_nacimiento':
                        $rowData[$header] = $this->procesarFechaExcel($value);
                        break;
                    case 'area':
                        // Convertir nombre de área a ID
                        $area = Area::where('nombre', $value)->first();
                        if (!$area) {
                            throw new Exception("Área no encontrada en fila {$rowNumber}: {$value}. Áreas disponibles: " . Area::pluck('nombre')->implode(', '));
                        }
                        $rowData['area_id'] = $area->id;
                        break;
                    case 'nivel':
                        // Convertir nombre de nivel a ID
                        $nivel = CategoryLevel::where('name', $value)->first();
                        if (!$nivel) {
                            throw new Exception("Nivel no encontrado en fila {$rowNumber}: {$value}. Niveles disponibles: " . CategoryLevel::pluck('name')->implode(', '));
                        }
                        $rowData['nivel_id'] = $nivel->id;
                        break;
                    case 'correo_electronico':
                        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            throw new Exception("Email inválido en fila {$rowNumber}: {$value}");
                        }
                        $rowData[$header] = strtolower($value);
                        break;
                    default:
                        $rowData[$header] = $value;
                        break;
                }
            }

            // Validar datos mínimos
            if (empty($rowData['nombres']) || empty($rowData['apellidos']) || empty($rowData['documento_identidad'])) {
                throw new Exception("Fila {$rowNumber} tiene datos incompletos. Se requiere al menos nombres, apellidos y documento de identidad.");
            }

            $data[] = $rowData;
        }

        if (empty($data)) {
            throw new Exception('No se encontraron datos válidos para procesar en el archivo.');
        }

        return $data;
    }

    /**
     * Lee archivo Excel usando PHPExcel directamente
     * NOTA: Temporalmente deshabilitado debido a incompatibilidad con PHP moderno
     */
    private function leerArchivoExcelDirecto($fullPath)
    {
        throw new Exception('La lectura directa de archivos Excel está temporalmente deshabilitada debido a incompatibilidades. Por favor, convierta el archivo a formato CSV.');

        /*
        // CÓDIGO COMENTADO TEMPORALMENTE - INCOMPATIBLE CON PHP MODERNO
        // TODO: Implementar con una librería más moderna cuando se actualice el proyecto

        return [];
        */
    }

    /**
     * Procesa fechas desde Excel a formato Y-m-d
     *
     * @param mixed $value Valor de fecha desde Excel
     * @return string Fecha en formato Y-m-d
     */
    private function procesarFechaExcel($value)
    {
        if (empty($value)) {
            throw new Exception('La fecha de nacimiento es requerida.');
        }

        // Si ya está en formato correcto (Y-m-d), devolverla
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }

        // Si es un número (fecha de Excel serializada)
        if (is_numeric($value)) {
            // Excel cuenta días desde 1900-01-01, pero tiene un bug con años bisiestos
            $unixTimestamp = ($value - 25569) * 86400;
            return date('Y-m-d', $unixTimestamp);
        }

        // Intentar parsear diferentes formatos de fecha
        $formats = ['d/m/Y', 'd-m-Y', 'Y/m/d', 'Y-m-d', 'd/m/y', 'd-m-y'];

        foreach ($formats as $format) {
            $date = \DateTime::createFromFormat($format, $value);
            if ($date !== false) {
                return $date->format('Y-m-d');
            }
        }

        throw new Exception("Formato de fecha inválido: {$value}. Use el formato DD/MM/YYYY o YYYY-MM-DD.");
    }

    /**
     * Valida que el archivo tenga la estructura correcta
     *
     * @param array $data Datos del archivo
     * @throws Exception Si la estructura es inválida
     */
    private function validarEstructuraArchivo($data)
    {
        if (empty($data)) {
            throw new Exception('El archivo no contiene datos.');
        }

        $camposRequeridosBasicos = [
            'nombres', 'apellidos', 'documento_identidad', 'fecha_nacimiento',
            'correo_electronico', 'colegio', 'curso', 'provincia'
        ];

        // Validar que el primer registro tenga todos los campos básicos requeridos
        $primeraFila = $data[0];
        foreach ($camposRequeridosBasicos as $campo) {
            if (!array_key_exists($campo, $primeraFila)) {
                throw new Exception("El archivo no tiene la estructura correcta. Falta el campo '{$campo}'.");
            }
        }

        // Validar que tenga área y nivel (ya sea en forma original o convertida)
        $tieneArea = array_key_exists('area', $primeraFila) || array_key_exists('area_id', $primeraFila);
        $tieneNivel = array_key_exists('nivel', $primeraFila) || array_key_exists('nivel_id', $primeraFila);

        if (!$tieneArea) {
            throw new Exception("El archivo no tiene la estructura correcta. Falta el campo 'area' o 'area_id'.");
        }

        if (!$tieneNivel) {
            throw new Exception("El archivo no tiene la estructura correcta. Falta el campo 'nivel' o 'nivel_id'.");
        }
    }

    /**
     * Crea competidores a partir de los datos del Excel
     *
     * @param array $data Datos extraídos del Excel
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @return array Competidores creados
     */
    private function crearCompetidores($data, RegistrationProcess $proceso)
    {
        $competidoresCreados = [];
        $this->competidoresCreados = 0;

        foreach ($data as $row) {
            // Validar datos del competidor
            $this->verificarDuplicados($row);

            // Verificar que las áreas y niveles existen
            $area = Area::find($row['area_id']);
            if (!$area) {
                throw new Exception("El área con ID {$row['area_id']} no existe.");
            }

            $nivel = CategoryLevel::find($row['nivel_id']);
            if (!$nivel) {
                throw new Exception("El nivel con ID {$row['nivel_id']} no existe.");
            }

            // Crear competidor
            $competidor = Competitor::create([
                'nombres' => $row['nombres'],
                'apellidos' => $row['apellidos'],
                'documento_identidad' => $row['documento_identidad'],
                'fecha_nacimiento' => $row['fecha_nacimiento'],
                'correo_electronico' => $row['correo_electronico'],
                'colegio' => $row['colegio'],
                'curso' => explode(' ', $row['curso'])[0],
                'nivel' => explode(' ', $row['curso'])[1],
                'provincia' => $row['provincia']
            ]);

            // Asociar competidor al proceso de inscripción utilizando el repositorio existente
            app(\App\Repositories\ProcesoInscripcionRepository::class)->agregarCompetidor($proceso->id, $competidor->id);

            // Asociar área y nivel al competidor
            $asignacion = CompetidorAreaNivel::create([
                'competitor_id' => $competidor->id,
                'area_id' => $row['area_id'],
                'category_level_id' => $row['nivel_id'],
                'registration_process_id' => $proceso->id
            ]);

            // CREAR LAS RELACIONES TUTOR-COMPETIDOR AUTOMÁTICAMENTE
            // Usar el servicio de inscripción grupal para crear las relaciones automáticas
            $inscripcionGrupalService = app(\App\Services\InscripcionGrupalService::class);
            $inscripcionGrupalService->crearRelacionesTutorCompetidorParaCSV($proceso, $competidor->id);

            $this->competidoresCreados++;

            $competidoresCreados[] = [
                'id' => $competidor->id,
                'nombres' => $competidor->nombres,
                'apellidos' => $competidor->apellidos,
                'documento_identidad' => $competidor->documento_identidad,
                'fecha_nacimiento' => $competidor->fecha_nacimiento,
                'correo_electronico' => $competidor->correo_electronico,
                'colegio' => $competidor->colegio,
                'curso' => $competidor->curso . ' ' . $competidor->nivel,
                'provincia' => $competidor->provincia,
                'area' => $area->nombre,
                'area_id' => $area->id,
                'nivel' => $nivel->name,
                'nivel_id' => $nivel->id
            ];
        }

        return $competidoresCreados;
    }

    /**
     * Valida los datos de un competidor
     *
     * @param array $datos Datos del competidor
     * @throws Exception Si los datos son inválidos
     */
    private function validarDatosCompetidor($datos)
    {
        // Implementación básica de validación, puede ampliarse según necesidades
        if (empty($datos['nombres']) || strlen($datos['nombres']) > 255) {
            throw new Exception('El nombre es requerido y no debe exceder 255 caracteres.');
        }

        if (empty($datos['apellidos']) || strlen($datos['apellidos']) > 255) {
            throw new Exception('Los apellidos son requeridos y no deben exceder 255 caracteres.');
        }

        if (empty($datos['documento_identidad']) || strlen($datos['documento_identidad']) > 20) {
            throw new Exception('El documento de identidad es requerido y no debe exceder 20 caracteres.');
        }

        // Verificar que no existe un competidor con el mismo documento de identidad
        $competidorExistente = Competitor::where('documento_identidad', $datos['documento_identidad'])->first();
        if ($competidorExistente) {
            throw new Exception("Ya existe un competidor con el documento de identidad {$datos['documento_identidad']}.");
        }

        // Verificar que no existe un competidor con el mismo correo electrónico
        $competidorExistente = Competitor::where('correo_electronico', $datos['correo_electronico'])->first();
        if ($competidorExistente) {
            throw new Exception("Ya existe un competidor con el correo electrónico {$datos['correo_electronico']}.");
        }
    }

    /**
     * Genera un archivo CSV de plantilla para la carga masiva
     *
     * @return string Ruta del archivo generado
     */
    public function generarPlantillaExcel()
    {
        try {
            // Datos para la plantilla
            $headers = [
                'nombres',
                'apellidos',
                'documento_identidad',
                'fecha_nacimiento',
                'correo_electronico',
                'colegio',
                'curso',
                'provincia',
                'area',
                'nivel'
            ];

            // Generar documentos únicos para evitar duplicados
            $timestamp = time();
            $random1 = rand(1000, 9999);
            $random2 = rand(1000, 9999);
            $random3 = rand(1000, 9999);

            // Ejemplos de datos con nombres reales de áreas y niveles y documentos únicos
            $ejemplos = [
                [
                    'Juan Carlos',
                    'Pérez López',
                    $timestamp . $random1, // Documento único
                    '2010-05-15',
                    'juan.perez.' . $random1 . '@email.com', // Email único
                    'Colegio San Martín',
                    '3 Secundaria',
                    'La Paz',
                    'Matemáticas',
                    'Básico Primaria'
                ],
                [
                    'María Elena',
                    'García Mendoza',
                    $timestamp . $random2, // Documento único
                    '2011-07-22',
                    'maria.garcia.' . $random2 . '@email.com', // Email único
                    'Colegio San José',
                    '2 Secundaria',
                    'Santa Cruz',
                    'Física',
                    'Física Secundaria'
                ],
                [
                    'Carlos Alberto',
                    'Mamani Quispe',
                    $timestamp . $random3, // Documento único
                    '2009-03-10',
                    'carlos.mamani.' . $random3 . '@email.com', // Email único
                    'Unidad Educativa Central',
                    '4 Secundaria',
                    'Cochabamba',
                    'Química',
                    'Química Secundaria'
                ]
            ];

            // Usar nombre único para generar plantilla fresca cada vez
            $fileName = 'plantilla_carga_masiva_' . date('Y_m_d_H_i_s');
            $filePath = 'private/plantillas/' . $fileName . '.csv';

            // Crear directorio si no existe
            Storage::makeDirectory('private/plantillas');

            // Generar archivo CSV con codificación UTF-8 correcta
            $csvContent = '';

            // Agregar BOM UTF-8 para compatibilidad con Excel
            $csvContent .= "\xEF\xBB\xBF";

            // Generar encabezados
            $csvContent .= implode(';', $headers) . "\r\n";

            // Agregar ejemplos de datos
            foreach ($ejemplos as $ejemplo) {
                $line = [];
                foreach ($ejemplo as $campo) {
                    // Siempre escapar campos de texto con comillas para evitar problemas de codificación
                    // Solo no usar comillas para números simples
                    if (is_numeric($campo) && !strpos($campo, '.') && !strpos($campo, '-')) {
                        $line[] = $campo;
                    } else {
                        // Escapar comillas dobles dentro del campo y envolver en comillas
                        $campo = '"' . str_replace('"', '""', $campo) . '"';
                        $line[] = $campo;
                    }
                }
                $csvContent .= implode(';', $line) . "\r\n";
            }

            // Guardar el archivo con codificación UTF-8
            Storage::put($filePath, $csvContent);

            return $filePath;

        } catch (Exception $e) {
            throw new Exception('Error al generar la plantilla CSV: ' . $e->getMessage());
        }
    }

    /**
     * Procesa un CSV directamente desde el contenido sin usar archivos temporales
     * Esta es una solución alternativa para evitar problemas de configuración de PHP
     *
     * @param string $csvContent Contenido del archivo CSV
     * @param RegistrationProcess $proceso Proceso de inscripción
     * @return array Resultado del procesamiento
     */
    public function procesarCSVDirecto(string $csvContent, RegistrationProcess $proceso)
    {
        try {
            // Validar que el contenido no esté vacío
            if (empty(trim($csvContent))) {
                throw new Exception('El archivo CSV está vacío o no contiene datos válidos');
            }

            // Procesar el contenido CSV directamente
            $data = $this->leerCSVDesdeTexto($csvContent);

            if (empty($data)) {
                throw new Exception('No se pudieron extraer datos válidos del archivo CSV');
            }

            // Validar estructura del archivo
            $this->validarEstructuraArchivo($data);

            // Procesar datos y crear competidores
            $competidoresCreados = $this->crearCompetidores($data, $proceso);

            return [
                'success' => true,
                'mensaje' => "Archivo procesado correctamente. {$this->getCompetidoresCreados()} competidores registrados.",
                'competidores_creados' => count($competidoresCreados),
                'competidores' => $competidoresCreados
            ];

        } catch (Exception $e) {
            // Proporcionar mensajes de error más específicos
            $mensaje = $this->getErrorMessage($e->getMessage());

            return [
                'success' => false,
                'mensaje' => $mensaje,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtiene un mensaje de error más amigable para el usuario
     */
    private function getErrorMessage(string $originalError): string
    {
        if (strpos($originalError, 'Falta el encabezado') !== false) {
            return 'Error en la estructura del archivo: ' . $originalError . ' Verifique que esté usando la plantilla correcta.';
        }

        if (strpos($originalError, 'Área no encontrada') !== false) {
            return 'Error en los datos: ' . $originalError;
        }

        if (strpos($originalError, 'Nivel no encontrado') !== false) {
            return 'Error en los datos: ' . $originalError;
        }

        if (strpos($originalError, 'Email inválido') !== false) {
            return 'Error en los datos: ' . $originalError;
        }

        if (strpos($originalError, 'Ya existe un competidor') !== false) {
            return 'Error de duplicados: ' . $originalError;
        }

        if (strpos($originalError, 'archivo CSV está vacío') !== false) {
            return 'El archivo está vacío o no contiene datos válidos. Verifique el contenido del archivo.';
        }

        return 'Error al procesar el archivo: ' . $originalError;
    }

    /**
     * Obtiene el mensaje de competidores creados
     */
    private function getCompetidoresCreados(): int
    {
        // Esta es una variable temporal que se puede ajustar
        return $this->competidoresCreados ?? 0;
    }

    /**
     * Lee contenido CSV desde texto sin usar archivos temporales
     *
     * @param string $csvContent Contenido del CSV
     * @return array Datos procesados
     */
    private function leerCSVDesdeTexto(string $csvContent)
    {
        try {
            // Remover BOM UTF-8 si existe
            if (substr($csvContent, 0, 3) === "\xEF\xBB\xBF") {
                $csvContent = substr($csvContent, 3);
            }

            // Dividir el contenido en líneas, manejando diferentes tipos de salto de línea
            $lines = preg_split('/\r\n|\r|\n/', $csvContent);

            // Filtrar líneas vacías
            $lines = array_filter($lines, function($line) {
                return trim($line) !== '';
            });

            if (empty($lines)) {
                throw new Exception('El archivo CSV está vacío o solo contiene líneas en blanco');
            }

            // Detectar separador usando la primera línea
            $firstLine = reset($lines);
            $separator = $this->detectarSeparadorCSV($firstLine);

            $data = [];
            $headers = null;
            $rowNumber = 0;

            foreach ($lines as $line) {
                $rowNumber++;

                // Procesar la línea CSV con manejo de comillas
                $row = $this->parseCSVLine($line, $separator);

                if ($rowNumber === 1) {
                    // Primera fila son los encabezados
                    $headers = array_map('trim', $row);

                    // Validar encabezados esperados
                    $this->validarEncabezadosCSV($headers);
                    continue;
                }

                // Procesar fila de datos
                if (empty(array_filter($row, function($cell) { return trim($cell) !== ''; }))) {
                    continue; // Saltar filas completamente vacías
                }

                $rowData = $this->procesarFilaCSV($row, $headers, $rowNumber);
                $data[] = $rowData;
            }

            if (empty($data)) {
                throw new Exception('No se encontraron datos válidos para procesar en el archivo CSV');
            }

            return $data;

        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Detecta el separador más probable para el CSV
     */
    private function detectarSeparadorCSV(string $line): string
    {
        $separators = [';', ',', '\t'];
        $counts = [];

        foreach ($separators as $sep) {
            $counts[$sep] = substr_count($line, $sep);
        }

        // Devolver el separador con más ocurrencias
        $maxSeparator = array_search(max($counts), $counts);
        return $maxSeparator ?: ';'; // Por defecto punto y coma
    }

    /**
     * Parsea una línea CSV manejando comillas correctamente
     */
    private function parseCSVLine(string $line, string $separator): array
    {
        // Usar str_getcsv con el separador detectado
        $row = str_getcsv($line, $separator, '"', '\\');

        // Limpiar cada celda de espacios extra
        return array_map(function($cell) {
            return trim($cell, " \t\n\r\0\x0B\"");
        }, $row);
    }

    /**
     * Valida que los encabezados requeridos estén presentes
     */
    private function validarEncabezadosCSV(array $headers): void
    {
        $expectedHeaders = [
            'nombres', 'apellidos', 'documento_identidad', 'fecha_nacimiento',
            'correo_electronico', 'colegio', 'curso', 'provincia', 'area', 'nivel'
        ];

        $missingHeaders = [];
        foreach ($expectedHeaders as $header) {
            if (!in_array($header, $headers)) {
                $missingHeaders[] = $header;
            }
        }

        if (!empty($missingHeaders)) {
            throw new Exception("Faltan los siguientes encabezados requeridos: '" . implode("', '", $missingHeaders) . "'. Encabezados encontrados: " . implode(', ', $headers));
        }
    }

    /**
     * Procesa una fila de datos del CSV
     */
    private function procesarFilaCSV(array $row, array $headers, int $rowNumber): array
    {
        $rowData = [];

        foreach ($headers as $index => $header) {
            $value = isset($row[$index]) ? trim($row[$index]) : '';

            // Procesar valores especiales
            switch ($header) {
                case 'fecha_nacimiento':
                    $rowData[$header] = $this->procesarFechaExcel($value);
                    break;
                case 'area':
                    // Convertir nombre de área a ID
                    $area = Area::where('nombre', $value)->first();
                    if (!$area) {
                        throw new Exception("Área no encontrada en fila {$rowNumber}: '{$value}'. Áreas disponibles: " . Area::pluck('nombre')->implode(', '));
                    }
                    $rowData['area_id'] = $area->id;
                    break;
                case 'nivel':
                    // Convertir nombre de nivel a ID
                    $nivel = CategoryLevel::where('name', $value)->first();
                    if (!$nivel) {
                        throw new Exception("Nivel no encontrado en fila {$rowNumber}: '{$value}'. Niveles disponibles: " . CategoryLevel::pluck('name')->implode(', '));
                    }
                    $rowData['nivel_id'] = $nivel->id;
                    break;
                case 'correo_electronico':
                    if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        throw new Exception("Email inválido en fila {$rowNumber}: '{$value}'");
                    }
                    $rowData[$header] = strtolower($value);
                    break;
                default:
                    $rowData[$header] = $value;
                    break;
            }
        }

        // Validar datos mínimos
        if (empty($rowData['nombres']) || empty($rowData['apellidos']) || empty($rowData['documento_identidad'])) {
            throw new Exception("Fila {$rowNumber} tiene datos incompletos. Se requiere al menos nombres, apellidos y documento de identidad.");
        }

        return $rowData;
    }

    /**
     * Verifica duplicados de competidores
     *
     * @param array $datos Datos del competidor
     * @throws Exception Si hay duplicados
     */
    private function verificarDuplicados($datos)
    {
        // Verificar que no existe un competidor con el mismo documento de identidad
        $competidorExistente = Competitor::where('documento_identidad', $datos['documento_identidad'])->first();
        if ($competidorExistente) {
            throw new Exception("Ya existe un competidor con el documento de identidad {$datos['documento_identidad']}.");
        }

        // Verificar que no existe un competidor con el mismo correo electrónico si se proporciona
        if (!empty($datos['correo_electronico'])) {
            $competidorExistente = Competitor::where('correo_electronico', $datos['correo_electronico'])->first();
            if ($competidorExistente) {
                throw new Exception("Ya existe un competidor con el correo electrónico {$datos['correo_electronico']}.");
            }
        }
    }
}
