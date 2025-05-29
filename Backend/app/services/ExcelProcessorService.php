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

        // Guardar el archivo en el almacenamiento
        $path = $file->store('uploads/inscripciones');

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
                return $this->leerArchivoCSV($fullPath);
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
        $handle = fopen($fullPath, 'r');
        if (!$handle) {
            throw new Exception('No se pudo abrir el archivo CSV.');
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
                    'correo_electronico', 'colegio', 'curso', 'provincia', 'area_id', 'nivel_id'
                ];

                foreach ($expectedHeaders as $header) {
                    if (!in_array($header, $headers)) {
                        fclose($handle);
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
                    case 'area_id':
                    case 'nivel_id':
                        $rowData[$header] = (int) $value;
                        break;
                    case 'correo_electronico':
                        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            fclose($handle);
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
                throw new Exception("Fila {$rowNumber} tiene datos incompletos. Se requiere al menos nombres, apellidos y documento de identidad.");
            }

            $data[] = $rowData;
        }

        fclose($handle);

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

        $camposRequeridos = [
            'nombres', 'apellidos', 'documento_identidad', 'fecha_nacimiento',
            'correo_electronico', 'colegio', 'curso', 'provincia', 'area_id', 'nivel_id'
        ];

        // Validar que el primer registro tenga todos los campos requeridos
        $primeraFila = $data[0];
        foreach ($camposRequeridos as $campo) {
            if (!array_key_exists($campo, $primeraFila)) {
                throw new Exception("El archivo no tiene la estructura correcta. Falta el campo '{$campo}'.");
            }
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

        foreach ($data as $row) {
            // Validar datos del competidor
            $this->validarDatosCompetidor($row);

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
            CompetidorAreaNivel::create([
                'competitor_id' => $competidor->id,
                'area_id' => $row['area_id'],
                'category_level_id' => $row['nivel_id'],
                'registration_process_id' => $proceso->id
            ]);

            $competidoresCreados[] = [
                'id' => $competidor->id,
                'nombres' => $competidor->nombres,
                'apellidos' => $competidor->apellidos,
                'documento_identidad' => $competidor->documento_identidad,
                'area' => $area->nombre,
                'nivel' => $nivel->name
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
                'area_id',
                'nivel_id'
            ];

            // Ejemplos de datos
            $ejemplos = [
                [
                    'Juan Carlos',
                    'Pérez López',
                    '12345678',
                    '2010-05-15',
                    'juan.perez@email.com',
                    'Colegio San Martín',
                    '3 Secundaria',
                    'La Paz',
                    '1',
                    '2'
                ],
                [
                    'María Elena',
                    'García Mendoza',
                    '87654321',
                    '2011-07-22',
                    'maria.garcia@email.com',
                    'Colegio San José',
                    '2 Secundaria',
                    'Santa Cruz',
                    '2',
                    '3'
                ]
            ];

            // Usar nombre fijo para reutilizar el mismo archivo
            $fileName = 'plantilla_carga_masiva';
            $filePath = 'plantillas/' . $fileName . '.csv';

            // Crear directorio si no existe
            Storage::makeDirectory('plantillas');

            // Si el archivo ya existe, retornarlo en lugar de crear uno nuevo
            if (Storage::exists($filePath)) {
                return $filePath;
            }

            // Generar archivo CSV usando funciones nativas de PHP con formato compatible para Excel
            $csvContent = '';

            // Agregar BOM UTF-8 para Excel
            $csvContent .= "\xEF\xBB\xBF";

            // Generar CSV con punto y coma como separador (formato español)
            $tempFile = tempnam(sys_get_temp_dir(), 'plantilla_csv');
            $handle = fopen($tempFile, 'w');

            // Configurar para usar punto y coma como separador
            fputcsv($handle, $headers, ';');

            // Agregar ejemplos de datos
            foreach ($ejemplos as $ejemplo) {
                fputcsv($handle, $ejemplo, ';');
            }

            fclose($handle);

            // Leer el contenido generado
            $csvContent .= file_get_contents($tempFile);
            unlink($tempFile);

            // Guardar el archivo
            Storage::put($filePath, $csvContent);

            return $filePath;

        } catch (Exception $e) {
            throw new Exception('Error al generar la plantilla CSV: ' . $e->getMessage());
        }
    }
}
