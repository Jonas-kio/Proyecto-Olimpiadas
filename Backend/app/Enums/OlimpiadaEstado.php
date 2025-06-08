<?php

namespace App\Enums;

enum OlimpiadaEstado: string
{
    case PENDIENTE = 'Pendiente';
    case ENPROCESO = 'En Proceso';
    case TERMINADO = 'Terminado';

    /**
     * @return array
     */
    public static function values(): array
    {
        return [
            self::PENDIENTE->value,
            self::ENPROCESO->value,
            self::TERMINADO->value,
        ];
    }

    /**
     * @param string 
     * @return bool
     */
    public static function isValid(string $value): bool
    {
        return in_array($value, self::values());
    }

    /**
     * @return array
     */
    public static function options(): array
    {
        return [
            self::PENDIENTE->value => 'Pendiente',
            self::ENPROCESO->value => 'En Proceso',
            self::TERMINADO->value => 'Terminado',
        ];
    }
}
