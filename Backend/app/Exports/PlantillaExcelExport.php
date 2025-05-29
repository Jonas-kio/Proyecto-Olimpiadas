<?php

namespace App\Exports;

/**
 * Exportador de plantilla Excel compatible con maatwebsite/excel v1.1.5
 */
class PlantillaExcelExport
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Retorna los datos para ser escritos al Excel
     */
    public function getData(): array
    {
        return $this->data;
    }
}
